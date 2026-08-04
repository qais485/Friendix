import { useEffect, useState } from "react";
import { useJoinStream, useLeaveStream } from "../hooks";
import type { LiveStream } from "@/types";

interface LiveStreamPlayerProps {
  stream: LiveStream;
  isHost: boolean;
}

export function LiveStreamPlayer({ stream, isHost }: LiveStreamPlayerProps) {
  const joinStream = useJoinStream();
  const leaveStream = useLeaveStream();
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (stream.status === "live" && !isHost && !hasJoined) {
      joinStream.mutateAsync(stream.id).then(() => setHasJoined(true)).catch(() => {});
    }
    return () => {
      if (hasJoined) leaveStream.mutateAsync(stream.id).catch(() => {});
    };
  }, [stream.status, stream.id, isHost, hasJoined, joinStream, leaveStream]);

  const getStatusBadge = () => {
    switch (stream.status) {
      case "live":
        return <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white animate-pulse">LIVE</span>;
      case "scheduled":
        return <span className="rounded-full bg-yellow-500 px-2.5 py-0.5 text-xs font-semibold text-white">SCHEDULED</span>;
      case "recording":
        return <span className="rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white">RECORDING</span>;
      case "replay":
        return <span className="rounded-full bg-purple-500 px-2.5 py-0.5 text-xs font-semibold text-white">REPLAY</span>;
      default:
        return null;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-foreground/5">
      <div className="aspect-video flex items-center justify-center bg-muted">
        {stream.status === "live" || stream.status === "recording" ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
              <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" />
              </svg>
            </div>
            <p className="font-semibold">Live Stream Active</p>
            <p className="mt-1 text-sm text-muted-foreground">{stream.viewers_count} viewers watching</p>
          </div>
        ) : stream.status === "replay" && stream.replay_url ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-semibold">Replay Available</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {stream.replay_duration ? `${Math.floor(stream.replay_duration / 60)}m ${stream.replay_duration % 60}s` : "Watch the replay"}
            </p>
          </div>
        ) : stream.status === "scheduled" ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-semibold">Scheduled Stream</p>
            {stream.scheduled_at && <p className="mt-1 text-sm text-muted-foreground">Starts at {new Date(stream.scheduled_at).toLocaleString()}</p>}
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-semibold">Stream Ended</p>
            {stream.ended_at && <p className="mt-1 text-sm text-muted-foreground">Ended at {new Date(stream.ended_at).toLocaleString()}</p>}
          </div>
        )}
      </div>

      <div className="absolute left-3 top-3 flex gap-2">
        {getStatusBadge()}
        {stream.is_recording && (
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white animate-pulse">REC</span>
        )}
      </div>

      <div className="absolute right-3 top-3">
        <span className="rounded-full bg-black/50 px-2.5 py-0.5 text-xs text-white backdrop-blur-sm">
          {stream.viewers_count} viewers
        </span>
      </div>

      <div className="absolute bottom-3 left-3 right-3">
        <div className="flex items-center gap-2 rounded-xl bg-black/40 px-3 py-2 backdrop-blur-sm">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
            {stream.user?.username?.charAt(0).toUpperCase() || "?"}
          </div>
          <p className="truncate text-sm font-medium text-white">
            {stream.user?.display_name || stream.user?.username || "Unknown"}
          </p>
        </div>
      </div>
    </div>
  );
}
