import apiClient from "./api";

export type TrackingContentType = "video" | "reel" | "post" | "story" | "live" | "media";

export type TrackingEventType =
  | "impression"
  | "view_start"
  | "watch_time"
  | "view_percentage"
  | "completion"
  | "skip"
  | "replay"
  | "like"
  | "comment"
  | "share"
  | "save"
  | "follow_after_view"
  | "not_interested"
  | "report";

export interface TrackOptions {
  event_type: TrackingEventType;
  content_type: TrackingContentType;
  content_id: string;
  creator_id?: string;
  value?: number;
  position_seconds?: number;
  context?: string;
  source?: string;
  metadata?: Record<string, unknown>;
  occurred_at?: string;
}

interface QueuedEvent extends TrackOptions {
  client_event_id: string;
  view_session_id?: string;
}

const FLUSH_INTERVAL_MS = 5000;
const FLUSH_THRESHOLD = 50;
const MAX_RETRIES = 5;

let queue: QueuedEvent[] = [];
let flushTimer: number | null = null;
let flushing = false;
let flushRetries = 0;

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let viewSessionId: string | null = null;

export function startViewSession(): string {
  if (!viewSessionId) viewSessionId = uuid();
  return viewSessionId;
}

export function resetViewSession(): void {
  viewSessionId = null;
}

export function getViewSessionId(): string | null {
  return viewSessionId;
}

function isAuthenticated(): boolean {
  const token = localStorage.getItem("access_token");
  return Boolean(token && token !== "undefined");
}

export function track(options: TrackOptions): void {
  if (!isAuthenticated()) return;
  const now = new Date().toISOString();
  const event: QueuedEvent = {
    client_event_id: uuid(),
    view_session_id: viewSessionId ?? undefined,
    occurred_at: options.occurred_at ?? now,
    metadata: {
      page: window.location.pathname,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      ...(options.metadata || {}),
    },
    ...options,
  };
  queue.push(event);
  scheduleFlush();
  if (queue.length >= FLUSH_THRESHOLD) flush();
}

async function flush(): Promise<void> {
  if (flushing || queue.length === 0) return;
  flushing = true;
  const batch = queue.splice(0, FLUSH_THRESHOLD);
  try {
    await apiClient.post("/tracking/events", { events: batch });
    flushRetries = 0;
  } catch {
    queue.unshift(...batch);
    flushRetries += 1;
  } finally {
    flushing = false;
  }
}

function scheduleFlush(): void {
  if (flushTimer !== null) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    if (flushRetries < MAX_RETRIES) {
      void flush();
      scheduleFlush();
    }
  }, FLUSH_INTERVAL_MS);
}

function flushOnHide(): void {
  if (queue.length === 0) return;
  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const token = localStorage.getItem("access_token");
    const headers = token ? { type: "application/json", Authorization: `Bearer ${token}` } : { type: "application/json" };
    navigator.sendBeacon(
      `${import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/v1` : "/api/v1"}/tracking/events`,
      new Blob([JSON.stringify({ events: queue.splice(0, queue.length) })], headers as BlobPropertyBag),
    );
  } else {
    void flush();
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", flushOnHide);
  window.addEventListener("pagehide", flushOnHide);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushOnHide();
  });
}

export function flushNow(): Promise<void> {
  return flush();
}

export const tracking = {
  impression: (o: Omit<TrackOptions, "event_type">) => track({ event_type: "impression", ...o }),
  viewStart: (o: Omit<TrackOptions, "event_type">) => track({ event_type: "view_start", ...o }),
  watchTime: (o: Omit<TrackOptions, "event_type">) => track({ event_type: "watch_time", ...o }),
  viewPercentage: (o: Omit<TrackOptions, "event_type">) => track({ event_type: "view_percentage", ...o }),
  completion: (o: Omit<TrackOptions, "event_type">) => track({ event_type: "completion", ...o }),
  skip: (o: Omit<TrackOptions, "event_type">) => track({ event_type: "skip", ...o }),
  replay: (o: Omit<TrackOptions, "event_type">) => track({ event_type: "replay", ...o }),
  like: (o: Omit<TrackOptions, "event_type">) => track({ event_type: "like", ...o }),
  comment: (o: Omit<TrackOptions, "event_type">) => track({ event_type: "comment", ...o }),
  share: (o: Omit<TrackOptions, "event_type">) => track({ event_type: "share", ...o }),
  save: (o: Omit<TrackOptions, "event_type">) => track({ event_type: "save", ...o }),
  follow: (o: Omit<TrackOptions, "event_type">) => track({ event_type: "follow_after_view", ...o }),
  notInterested: (o: Omit<TrackOptions, "event_type">) => track({ event_type: "not_interested", ...o }),
  report: (o: Omit<TrackOptions, "event_type">) => track({ event_type: "report", ...o }),
};

export default tracking;
