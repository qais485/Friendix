import { useState, useEffect } from "react";
import api from "@/services/api";
import { getCloudinaryTransformedUrl, type CloudinaryPreset } from "./cloudinaryTransform";
import type { Media } from "@/types";

// ── Public helpers ────────────────────────────────────────────────

/**
 * Returns the best URL for displaying a media item.
 * - "everyone" privacy: returns optimized Cloudinary URL (no auth needed)
 * - "friends"/"only_me": returns proxy URL (requires auth via Axios)
 */
export function getMediaDisplayUrl(media: Media, preset: CloudinaryPreset = "feed"): string {
  if (media.privacy === "everyone") {
    return getCloudinaryTransformedUrl(media.file_url, preset);
  }
  return `/api/v1/media/proxy/${media.id}`;
}

// ── Blob URL cache for private media ──────────────────────────────
// Persists across component mounts so revisiting the same media reuses
// the existing blob URL instead of re-downloading through the proxy.
const blobUrlCache = new Map<string, string>();
const blobRefCounts = new Map<string, number>();
const inflightFetches = new Map<string, Promise<string | null>>();

function getCachedBlobUrl(mediaId: string): string | null {
  return blobUrlCache.get(mediaId) ?? null;
}

function retainBlobUrl(mediaId: string): void {
  blobRefCounts.set(mediaId, (blobRefCounts.get(mediaId) ?? 0) + 1);
}

function releaseBlobUrl(mediaId: string): void {
  const count = (blobRefCounts.get(mediaId) ?? 1) - 1;
  if (count <= 0) {
    blobRefCounts.delete(mediaId);
    const url = blobUrlCache.get(mediaId);
    if (url) {
      URL.revokeObjectURL(url);
      blobUrlCache.delete(mediaId);
    }
  } else {
    blobRefCounts.set(mediaId, count);
  }
}

async function fetchAndCacheBlob(mediaId: string): Promise<string | null> {
  const existing = getCachedBlobUrl(mediaId);
  if (existing) return existing;

  const inflight = inflightFetches.get(mediaId);
  if (inflight) return inflight;

  const promise = (async () => {
    try {
      const response = await api.get(`/media/proxy/${mediaId}`, {
        responseType: "blob",
      });
      const blobUrl = URL.createObjectURL(response.data);
      blobUrlCache.set(mediaId, blobUrl);
      return blobUrl;
    } catch {
      return null;
    } finally {
      inflightFetches.delete(mediaId);
    }
  })();

  inflightFetches.set(mediaId, promise);
  return promise;
}

// ── Hook ──────────────────────────────────────────────────────────

/**
 * Returns a URL safe for use in <img>/<video>/<audio> src attributes.
 * For public media, returns the optimized Cloudinary URL.
 * For private media, fetches via Axios (with JWT) and returns a cached blob URL.
 */
export function useSecureMediaUrl(
  media: Media | null | undefined,
  preset: CloudinaryPreset = "feed",
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!media) {
      setUrl(null);
      return;
    }

    if (media.privacy === "everyone") {
      setUrl(getCloudinaryTransformedUrl(media.file_url, preset));
      return;
    }

    let active = true;

    fetchAndCacheBlob(media.id).then((blobUrl) => {
      if (!active) return;
      if (blobUrl) {
        retainBlobUrl(media.id);
        setUrl(blobUrl);
      } else {
        setUrl(null);
      }
    });

    return () => {
      active = false;
      if (media.privacy !== "everyone") {
        releaseBlobUrl(media.id);
      }
    };
  }, [media?.id, media?.privacy, media?.file_url, preset]);

  return url;
}
