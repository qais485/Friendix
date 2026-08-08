import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { getVideoPosterUrl } from "@/lib/cloudinaryTransform";
import { Button } from "@/components/ui/button";
import { tracking } from "@/services/tracking";
import type { Video } from "@/types/videos";

interface VideoPlayerProps {
  video: Video;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPlayer({ video, onProgress, onEnded, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    let viewStarted = false;
    let lastWatchSeconds = 0;
    const onTimeUpdate = () => {
      setCurrentTime(el.currentTime);
      if (onProgress && el.duration) {
        onProgress(el.currentTime / el.duration);
      }
      if (viewStarted && el.currentTime - lastWatchSeconds >= 10) {
        lastWatchSeconds = el.currentTime;
        tracking.watchTime({
          content_type: "video",
          content_id: video.id,
          creator_id: video.user_id,
          value: Math.round(el.currentTime),
          position_seconds: Math.round(el.currentTime),
          context: "watch",
        });
      }
    };
    const onLoadedMetadata = () => setDuration(el.duration);
    const onPlay = () => {
      setIsPlaying(true);
      if (!viewStarted) {
        viewStarted = true;
        tracking.viewStart({
          content_type: "video",
          content_id: video.id,
          creator_id: video.user_id,
          context: "watch",
        });
      }
    };
    const onPause = () => setIsPlaying(false);
    const onEndedHandler = () => {
      setIsPlaying(false);
      if (viewStarted) {
        tracking.completion({
          content_type: "video",
          content_id: video.id,
          creator_id: video.user_id,
          value: 100,
          position_seconds: Math.round(el.duration),
          context: "watch",
        });
      }
      onEnded?.();
    };
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEndedHandler);
    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEndedHandler);
    };
  }, [onProgress, onEnded, video.id, video.user_id]);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play();
    else el.pause();
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(!isMuted);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = videoRef.current;
    const bar = progressRef.current;
    if (!el || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    el.currentTime = pct * el.duration;
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen();
  };

  const skip = (seconds: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(el.duration, el.currentTime + seconds));
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <div
      ref={containerRef}
      className="relative group bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={video.video_url}
        poster={getVideoPosterUrl(video.thumbnail_url ?? video.video_url)}
        className="w-full max-h-[70vh] object-contain mx-auto"
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        onClick={togglePlay}
      />

      {/* Play overlay when paused */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl">
            <Play className="h-7 w-7 fill-black text-black ml-1" />
          </div>
        </button>
      )}

      {/* Controls bar */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 transition-opacity",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="relative h-1.5 w-full cursor-pointer rounded-full bg-white/30 mb-3 group/progress"
          onClick={seek}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
          />
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-primary opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: duration ? `calc(${(currentTime / duration) * 100}% - 7px)` : "0" }}
          />
        </div>

          <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-white hover:bg-white/20" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-white hover:bg-white/20" onClick={() => skip(-10)}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-white hover:bg-white/20" onClick={() => skip(10)}>
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-white hover:bg-white/20" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <span className="shrink-0 text-xs text-white/80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-white hover:bg-white/20" onClick={toggleFullscreen}>
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
