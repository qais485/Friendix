type Entry = {
  postEl: HTMLElement;
  video: HTMLVideoElement | null;
  /** Visible percentage (intersection ratio) of the post in the viewport. */
  ratio: number;
  observer: IntersectionObserver | null;
  onActive: ((active: boolean) => void) | null;
};

/** Module-wide registry of feed posts eligible for "active post" detection. */
const entries = new Set<Entry>();

/** Ratio steps the observer reports on, for smooth scroll tracking. */
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

let previousActive: Entry | null = null;

/**
 * When true, a modal is open and all feed videos should stay paused.
 * updatePlayback() respects this flag and never plays feed videos while
 * a modal is active.
 */
let modalOpen = false;

/**
 * Pick the post with the highest visible percentage in the viewport.
 * Ties keep the earlier-registered (currently active) post.
 */
function pickActivePost(): Entry | null {
  let best: Entry | null = null;
  let bestRatio = -1;

  for (const entry of entries) {
    if (entry.ratio > bestRatio) {
      bestRatio = entry.ratio;
      best = entry;
    }
  }

  return best;
}

/**
 * The active post is the most-visible one. Playback rules:
 * - If a modal is open, ALL feed videos stay paused (never play).
 * - Active post: play its video (with sound). If the video already finished,
 *   keep it paused on the last frame (the Replay overlay shows) — never
 *   auto-restart it while the post remains active.
 * - Inactive post: pause its video and rewind to the start, so the ended
 *   state is reset and returning to this post restarts from the beginning.
 * - Image/text posts have no video, so when they are active all videos pause.
 */
function updatePlayback() {
  if (entries.size === 0) return;

  const active = modalOpen ? null : pickActivePost();

  if (previousActive !== active) {
    previousActive?.onActive?.(false);
    active?.onActive?.(true);
    previousActive = active;
  }

  entries.forEach((entry) => {
    const video = entry.video;
    if (!video) return;

    if (modalOpen) {
      // When a modal is open, pause all feed videos without rewinding
      // so the feed state is preserved for resume.
      video.pause();
      return;
    }

    if (entry === active) {
      if (!video.ended) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    } else {
      video.pause();
      video.currentTime = 0;
    }
  });
}

/**
 * Register a feed post for visibility-based active detection. Returns a handle
 * to attach/detach the post's video, to observe active-state changes, and to
 * unregister the post.
 */
export function registerActivePost(postEl: HTMLElement) {
  const entry: Entry = { postEl, video: null, ratio: 0, observer: null, onActive: null };

  if ("IntersectionObserver" in window) {
    entry.observer = new IntersectionObserver(
      (observed) => {
        const e = observed[0];
        if (!e) return;
        entry.ratio = e.intersectionRatio;
        updatePlayback();
      },
      { threshold: THRESHOLDS }
    );
    entry.observer.observe(postEl);
  } else {
    entry.ratio = 1;
  }

  entries.add(entry);
  updatePlayback();

  return {
    /** Attach (or detach) the video element rendered inside this post. */
    setVideo(video: HTMLVideoElement | null) {
      entry.video = video;
      updatePlayback();
    },
    /** Observe whether this post is currently the active post. */
    setOnActive(cb: (active: boolean) => void) {
      entry.onActive = cb;
    },
    unregister() {
      entry.observer?.disconnect();
      entries.delete(entry);
      if (previousActive === entry) previousActive = null;
      updatePlayback();
    },
  };
}

// ── Modal coordination API ───────────────────────────────────────

/**
 * Call when a PostModal (or any overlay with video) opens.
 * Pauses all feed videos immediately. Feed playback stays frozen
 * until {@link onModalClosed} is called.
 */
export function onModalOpened() {
  modalOpen = true;
  updatePlayback();
}

/**
 * Call when a PostModal closes.
 * Resumes the normal viewport-based feed playback.
 */
export function onModalClosed() {
  modalOpen = false;
  updatePlayback();
}
