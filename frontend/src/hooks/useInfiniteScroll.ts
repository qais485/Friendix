import { useEffect, type RefObject } from "react";

interface UseInfiniteScrollOptions {
  enabled?: boolean;
  rootMargin?: string;
  threshold?: number | number[];
}

export function useInfiniteScroll(
  sentinelRef: RefObject<HTMLElement | null>,
  onIntersect: () => void,
  options: UseInfiniteScrollOptions = {}
) {
  const { enabled = true, rootMargin = "200px", threshold = 0.1 } = options;

  useEffect(() => {
    if (!enabled) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersect();
      },
      { rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin, threshold, onIntersect]);
}