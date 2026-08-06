import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";

interface LazyVideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
  /** How far (px) before entering the viewport the source should be attached. */
  rootMargin?: string;
  /** Called with the underlying <video> once the source is attached (null on unmount). */
  onReady?: (video: HTMLVideoElement | null) => void;
}

/**
 * Defers loading a video's source until it is near the viewport, using
 * `preload="none"` so the bytes are only fetched when the element is about
 * to be seen (or interacted with).
 *
 * Playback itself is managed by the active-post coordinator (`lib/activePost`):
 * the post whose center is nearest the viewport center plays its video, and
 * every other video pauses. This component only attaches the source and
 * reports its element through `onReady`.
 */
export function LazyVideo({
  src,
  poster,
  rootMargin = "600px",
  onReady,
  ...rest
}: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Fallback: no IntersectionObserver support.
    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    // Loader: attaches the source as the video approaches the viewport.
    const loadObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setShouldLoad(true);
      },
      { rootMargin }
    );
    loadObserver.observe(node);
    return () => loadObserver.disconnect();
  }, [rootMargin]);

  // Report the element once the source is attached.
  useEffect(() => {
    if (shouldLoad) onReady?.(ref.current);
  }, [shouldLoad, onReady]);

  // Detach on unmount.
  useEffect(() => () => onReady?.(null), [onReady]);

  return (
    <video
      ref={ref}
      preload="none"
      poster={poster}
      playsInline
      onClick={() => setShouldLoad(true)}
      {...(shouldLoad ? { src } : {})}
      {...rest}
    />
  );
}