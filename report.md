# Media Caching & Optimization Audit

## Problem

Images and videos from Cloudinary are served at full size with no caching strategy, no format optimization, and no lazy loading. Every page load re-downloads all visible media at original quality.

---

## Findings

### 1. Zero Cloudinary Transformations

Uploads return raw `secure_url` with no query params (`frontend/src/lib/cloudinary.ts:28`).

| Transformation | Status | Impact |
|---|---|---|
| `f_auto` (AVIF/WebP) | Missing | 25-50% larger files |
| `q_auto` (quality) | Missing | Full quality when 75% is fine |
| `w_`/`h_`/`c_fill` (resize) | Missing | Full-size for all viewports |
| `fl_progressive` | Missing | Slower perceived load |

The `cloudinary_public_id` is stored in the DB (`backend/app/models/models.py:381`) but never used for URL construction.

### 2. No `loading="lazy"` Anywhere

All 30+ `<img>` and `<video>` tags across the codebase use eager loading. Key locations:

- `PostCard.tsx` — feed images, shared post images
- `PostModal.tsx` — modal images, video
- `MediaCard.tsx`, `MediaViewer.tsx` — media library
- `StoryViewer.tsx`, `ReelPlayer.tsx`, `StoriesRow.tsx` — stories/reels
- `avatar.tsx` — all avatars

No `decoding="async"`, no `srcSet`, no `sizes`, no `width`/`height` attributes.

### 3. Media Proxy Has No Cache Headers

`backend/app/api/v1/media.py:585-591` — The `StreamingResponse` for proxied private media sets no `Cache-Control`, `ETag`, or `Last-Modified`. Every request re-fetches from Cloudinary.

### 4. No HTTP Caching on Feed API

`backend/app/main.py` — No cache-control middleware. Feed responses are not cached at the HTTP level.

### 5. TanStack Query Has Default staleTime

`frontend/src/main.tsx:9-16` — `staleTime: 0` (default) means data is immediately stale. Components re-mount triggers refetch of feed data. `refetchOnWindowFocus: false` helps, but `staleTime: 0` still causes unnecessary API calls.

### 6. No Service Worker

No `service-worker.ts`, `sw.js`, or Workbox config exists. No offline caching of assets.

### 7. No Preconnect to Cloudinary CDN

`frontend/index.html` — Only Google Fonts has preconnect. Browser resolves `res.cloudinary.com` on first image load (extra DNS+TLS round-trip).

### 8. No Responsive Image Variants

Same full-size URL used for story thumbnails, feed cards, media grid, and modals. A 4000px image is downloaded for a 200px thumbnail.

---

## Recommended Solutions

### Quick Wins (High Impact, Low Effort)

1. **Add Cloudinary transformation params** to upload response or apply at display time:
   ```
   ?f_auto,q_auto,w_800,c_fill
   ```
   For thumbnails: `?f_auto,q_auto,w_200,h_200,c_fill`
   For feed: `?f_auto,q_auto,w_800,c_fill`
   For modal: `?f_auto,q_auto,w_1200,c_fit`

2. **Add `loading="lazy"` and `decoding="async"`** to all `<img>` tags below the fold.

3. **Add preconnect** to `index.html`:
   ```html
   <link rel="preconnect" href="https://res.cloudinary.com" />
   ```

4. **Set `staleTime` on feed queries** to 30-60 seconds to avoid redundant refetches.

### Medium Effort

5. **Add Cache-Control headers** to the media proxy endpoint:
   ```python
   headers={"Cache-Control": "public, max-age=31536000, immutable"}
   ```

6. **Create a responsive `<CloudImage>` component** that generates `srcSet` from the Cloudinary URL for different viewport widths.

7. **Add `width` and `height` attributes** to prevent layout shift (CLS).

### Larger Effort

8. **Implement a service worker** (Workbox) for offline caching of static assets and previously-viewed images.

9. **Generate thumbnail variants** on upload and store separate URLs for feed cards vs. full-view modals.

10. **Add GZip/Brotli middleware** to the backend for smaller API responses.
