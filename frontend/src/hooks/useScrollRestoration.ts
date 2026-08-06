import { useEffect, useRef } from "react";

const STORAGE_PREFIX = "friendix:scroll:";

function readStored(key: string): number {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return raw ? Number.parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function writeStored(key: string, value: number) {
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, String(value));
  } catch {
    // Storage unavailable (private mode, etc.) - ignore.
  }
}

/**
 * Persists and restores window scroll position keyed by `key` so navigating
 * back to a feed keeps the user at their previous scroll depth.
 */
export function useScrollRestoration(key: string | undefined, enabled = true) {
  const restored = useRef(false);

  useEffect(() => {
    if (!enabled || !key) return;
    const target = readStored(key);
    if (target > 0 && !restored.current) {
      restored.current = true;
      window.requestAnimationFrame(() => window.scrollTo(0, target));
    }

    const onScroll = () => {
      const ref = document.scrollingElement || document.documentElement;
      writeStored(key, ref.scrollTop);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [key, enabled]);
}