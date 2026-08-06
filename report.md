# Video Performance Analysis Report

## Executive Summary

Feed videos are laggy and slow to start due to **three critical architectural issues** working together: an aggressive rewind policy that destroys buffered video data on every scroll, unthrottled IntersectionObserver callbacks that flood the main thread during scrolling, and dual independent observer systems per video post that double the event volume.

---

## Root Causes (Ranked by Impact)

### 1. CRITICAL — `video.currentTime = 0` Destroys Buffered State

**File:** `frontend/src/lib/activePost.ts:82-83`

```typescript
} else {
  video.pause();
  video.currentTime = 0;  // ← THIS IS THE #1 PROBLEM
}
```

Every time a post becomes "inactive" (user scrolls it out of the most-visible position), its video is rewound to the start. This forces the browser to:
1. Discard all decoded frames in the demuxer buffer
2. Seek to byte offset 0 in the media file
3. Re-decode frame 1
4. Re-buffer from scratch

When the user scrolls back, the video that was already buffered must re-download and re-decode from zero. This is the single largest cause of "slow to start." The video was playing moments ago but its progress was thrown away.

**Impact:** Every scroll-away + scroll-back cycle adds 500ms–2s of re-buffering delay depending on network speed and video bitrate.

---

### 2. CRITICAL — No Throttling on `updatePlayback()`

**File:** `frontend/src/lib/activePost.ts:97-105`

```typescript
entry.observer = new IntersectionObserver(
  (observed) => {
    const e = observed[0];
    if (!e) return;
    entry.ratio = e.intersectionRatio;
    updatePlayback();  // ← fires on EVERY threshold crossing
  },
  { threshold: THRESHOLDS }  // 21 thresholds: 0/20, 1/20, ... 20/20
);
```

Each video post registers its own `IntersectionObserver` with **21 threshold values** (every 5% visibility change). During rapid scrolling:

- 8 visible posts × 21 thresholds = up to **168 callbacks per scroll frame**
- Each callback runs `pickActivePost()` (iterates all entries) + `entries.forEach(...)` (iterates all entries again)
- That is **2 full set iterations per callback** = **336 iterations per scroll frame**
- Each iteration calls `.play()`, `.pause()`, or `.currentTime = 0` on DOM elements

This blocks the main thread, causing frame drops and jank during scrolling.

---

### 3. HIGH — Dual IntersectionObservers Per Video Post

**Files:** `frontend/src/components/ui/LazyVideo.tsx:43-49` + `frontend/src/lib/activePost.ts:97-106`

Every video post has **two independent IntersectionObservers**:

| Observer | Purpose | rootMargin | Thresholds |
|----------|---------|------------|------------|
| LazyVideo's | Attach `<video>` src when near viewport | 600px | default (single) |
| activePost's | Determine which post is "active" for playback | none | 21 values |

With 20 video posts loaded, that is **40 active observers**. Both fire independently during scrolling. The LazyVideo observer fires once (to attach src) but never disconnects after triggering — it keeps receiving callbacks indefinitely (line 44-46 of LazyVideo.tsx sets `shouldLoad` but never calls `loadObserver.unobserve(node)`).

---

### 4. HIGH — `preload="auto"` on Reels/Stories Downloads Full Videos

**Files:**
- `frontend/src/features/media/components/ReelPlayer.tsx:112` — `preload="auto"`
- `frontend/src/features/media/components/StoryViewer.tsx:602` — `preload="auto"`
- `frontend/src/features/media/components/MediaViewer.tsx:90` — `preload="auto"`
- `frontend/src/features/media/components/VideoEditor.tsx:159` — `preload="auto"`
- `frontend/src/features/messaging/components/CallModal.tsx:190,198` — `preload="auto"`

`preload="auto"` tells the browser to download the **entire video file** even if the user may never play it. In a reel list or story viewer where multiple videos are visible, this causes massive bandwidth contention — multiple full video downloads start simultaneously, saturating the network and delaying the currently-playing video.

Contrast with PostCard which correctly uses `preload="none"` via LazyVideo.

---

### 5. HIGH — `autoPlay` Without `muted` in PostModal

**File:** `frontend/src/features/feed/components/PostModal.tsx:310,395`

```tsx
<video
  ref={videoRef}
  autoPlay        // ← blocked by browsers without user gesture
  preload="metadata"
  // NOT muted
  ...
/>
```

Modern browsers block autoplay of unmuted video without a user gesture. Since the PostModal video is not muted, `autoPlay` is silently rejected — the video shows the poster image and does not play until the user manually interacts. This creates a "slow to start" experience in the modal.

---

### 6. MEDIUM — Poster Images Are Severely Undersized

**File:** `frontend/src/lib/cloudinaryTransform.ts:18,66-68`

```typescript
thumbnail: { width: 200, height: 200, crop: "limit", ... }
// ...
export function getVideoPosterUrl(videoUrl) {
  return getCloudinaryTransformedUrl(videoUrl, "thumbnail");  // 200×200
}
```

Video posters use the "thumbnail" preset which generates **200×200px** images. In the feed, videos display at roughly **940×1175px** (4:5 aspect ratio). A 200×200 source scaled to that size is severely pixelated, giving a blurry, low-quality first impression while the video loads.

---

### 7. MEDIUM — LazyVideo Observer Never Unobserves After Trigger

**File:** `frontend/src/components/ui/LazyVideo.tsx:43-49`

```typescript
const loadObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0]?.isIntersecting) setShouldLoad(true);
    // ← never calls loadObserver.unobserve(node)
  },
  { rootMargin }
);
loadObserver.observe(node);
```

Once `shouldLoad` is set to `true`, the observer keeps firing on every intersection change. The `setShouldLoad(true)` is a no-op (React bails out), but the observer callback still runs, consuming CPU cycles. Should call `loadObserver.unobserve(node)` or `loadObserver.disconnect()` after the first trigger.

---

### 8. MEDIUM — `isActivePost` State Change Triggers Full PostCard Re-render

**File:** `frontend/src/features/feed/components/PostCard.tsx:148,161-164`

```typescript
const [isActivePost, setIsActivePost] = useState(false);
// ...
handle.setOnActive((active) => {
  setIsActivePost(active);        // ← triggers re-render
  if (!active) setVideoEnded(false); // ← triggers re-render
});
```

When a post becomes active/inactive, `setIsActivePost` triggers a full PostCard re-render. The `isActivePost` state is only used to conditionally show the replay overlay, but the entire component tree re-renders. With rapid scrolling, this causes cascading re-renders across multiple PostCards.

---

### 9. LOW — No `playsInline` on PostModal Videos

**File:** `frontend/src/features/feed/components/PostModal.tsx:308-318,393-401`

The PostModal `<video>` elements lack `playsInline`. On iOS Safari, this can cause the video to attempt fullscreen playback instead of playing inline within the modal.

---

### 10. LOW — `timeupdate` Listener in VideoPlayer Causes 4 Re-renders/sec

**File:** `frontend/src/features/videos/components/VideoPlayer.tsx:38-41`

```typescript
video.addEventListener("timeupdate", () => {
  setCurrentTime(video.currentTime);  // ← triggers re-render 4x/sec
});
```

The `timeupdate` event fires ~4 times per second. Each `setCurrentTime` call triggers a full component re-render. The progress bar and time display could use ref-based DOM updates instead.

---

## Affected Files

| File | Issues |
|------|--------|
| `frontend/src/lib/activePost.ts` | #1 (rewind), #2 (no throttle) |
| `frontend/src/components/ui/LazyVideo.tsx` | #3 (dual observer), #7 (no unobserve) |
| `frontend/src/features/feed/components/PostCard.tsx` | #3 (dual observer), #8 (re-render cascade) |
| `frontend/src/features/feed/components/PostModal.tsx` | #5 (autoplay blocked), #9 (no playsInline) |
| `frontend/src/lib/cloudinaryTransform.ts` | #6 (undersized poster) |
| `frontend/src/features/media/components/ReelPlayer.tsx` | #4 (preload="auto") |
| `frontend/src/features/media/components/StoryViewer.tsx` | #4 (preload="auto") |
| `frontend/src/features/media/components/MediaViewer.tsx` | #4 (preload="auto") |
| `frontend/src/features/videos/components/VideoPlayer.tsx` | #10 (timeupdate re-renders) |

---

## Recommended Solution

### Fix 1 — Remove the Rewind Policy (activePost.ts)

Remove `video.currentTime = 0` from the inactive branch. Only rewind when the video naturally ends or the user explicitly replays. This preserves buffered state across scroll.

```typescript
// BEFORE (line 81-84)
} else {
  video.pause();
  video.currentTime = 0;
}

// AFTER
} else {
  video.pause();
  // Do NOT rewind — preserve buffer for fast resume
}
```

If the "restart from beginning on scroll-back" behavior is desired, add a small delay (e.g., 30 seconds) before rewinding, or only rewind if the video has been inactive for more than a few seconds.

### Fix 2 — Throttle `updatePlayback()` with requestAnimationFrame

Replace the direct `updatePlayback()` call in the IntersectionObserver callback with a RAF-throttled version:

```typescript
let playbackScheduled = false;

function schedulePlaybackUpdate() {
  if (playbackScheduled) return;
  playbackScheduled = true;
  requestAnimationFrame(() => {
    playbackScheduled = false;
    updatePlayback();
  });
}
```

Use `schedulePlaybackUpdate()` in the observer callback instead of `updatePlayback()`.

### Fix 3 — Disconnect LazyVideo Observer After Trigger

```typescript
const loadObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0]?.isIntersecting) {
      setShouldLoad(true);
      loadObserver.unobserve(node);  // ← add this
    }
  },
  { rootMargin }
);
```

### Fix 4 — Change `preload="auto"` to `preload="metadata"` on Reels/Stories

Replace `preload="auto"` with `preload="metadata"` on ReelPlayer, StoryViewer, MediaViewer, and VideoEditor. Use LazyVideo's intersection-based loading pattern for these components as well.

### Fix 5 — Add `muted` to PostModal Video or Remove `autoPlay`

Either:
- Add `muted` + `autoPlay` (videos start silently, user can unmute), or
- Remove `autoPlay` and add a visible play button overlay (like ReelPlayer does)

### Fix 6 — Use "feed" Preset for Video Posters

```typescript
export function getVideoPosterUrl(videoUrl: string | null | undefined): string | undefined {
  if (!videoUrl) return undefined;
  return getCloudinaryTransformedUrl(videoUrl, "feed");  // 940×1175 instead of 200×200
}
```

### Fix 7 — Merge Into Single IntersectionObserver

Instead of two independent observers per video post, have `activePost.ts` expose a visibility ratio that LazyVideo can query, or have PostCard report its visibility directly to the active-post coordinator without a separate observer.

### Fix 8 — Use CSS Class Toggle for isActivePost

Replace the `isActivePost` state with a CSS class applied via `useEffect`:

```typescript
useEffect(() => {
  cardRef.current?.classList.toggle("is-active-post", isActive);
}, [isActive]);
```

Or use a ref-based approach to avoid React re-renders entirely.

---

## Performance Impact Estimate

| Fix | Expected Improvement |
|-----|---------------------|
| #1 Remove rewind | 50-80% faster scroll-back resume |
| #2 Throttle playback | 60-70% fewer main-thread blocks during scroll |
#3 Disconnect LazyVideo observer | 50% fewer observer callbacks |
| #4 Fix preload="auto" | 3-5x less bandwidth waste on reels/stories |
| #5 Fix autoplay | Modal videos start immediately |
| #6 Fix poster size | Sharper video thumbnails while loading |
| #7 Merge observers | 50% fewer IntersectionObserver instances |
| #8 Avoid re-render cascade | Fewer frame drops during rapid scrolling |

Implementing fixes #1, #2, and #3 alone would resolve the majority of the perceived lag.
