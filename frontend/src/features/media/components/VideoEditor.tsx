import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Scissors,
  Volume2,
  VolumeX,
  Check,
  X,
  SkipBack,
  SkipForward,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoEditorProps {
  videoUrl: string;
  onSave: (editedUrl: string) => void;
  onCancel: () => void;
}

interface TrimState {
  startTime: number;
  endTime: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function VideoEditor({ videoUrl, onSave, onCancel }: VideoEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trim, setTrim] = useState<TrimState>({ startTime: 0, endTime: 0 });
  const [activeTool, setActiveTool] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoaded = () => {
      setDuration(video.duration);
      setTrim({ startTime: 0, endTime: video.duration });
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime >= trim.endTime) {
        video.pause();
        setIsPlaying(false);
      }
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [trim.endTime]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      if (
        video.currentTime < trim.startTime ||
        video.currentTime >= trim.endTime
      ) {
        video.currentTime = trim.startTime;
      }
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const setTrimStart = () => {
    setTrim((prev) => ({ ...prev, startTime: currentTime }));
  };

  const setTrimEnd = () => {
    setTrim((prev) => ({ ...prev, endTime: currentTime }));
  };

  const skipToStart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = trim.startTime;
      setCurrentTime(trim.startTime);
    }
  };

  const skipToEnd = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = trim.endTime;
      setCurrentTime(trim.endTime);
    }
  };

  const resetTrim = () => {
    setTrim({ startTime: 0, endTime: duration });
  };

  const handleSave = () => {
    onSave(videoUrl);
  };

  const trimProgress =
    duration > 0
      ? ((currentTime - trim.startTime) / (trim.endTime - trim.startTime)) * 100
      : 0;

  const trimmedDuration = trim.endTime - trim.startTime;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col bg-black"
    >
      <div className="flex items-center justify-between bg-background px-4 py-3">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <h2 className="text-lg font-semibold">Edit Video</h2>
        <Button size="sm" onClick={handleSave}>
          <Check className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 items-center justify-center p-4">
          <video
            ref={videoRef}
            src={videoUrl}
            className="max-h-[70vh] max-w-full rounded-lg"
            muted={isMuted}
            playsInline
            preload="auto"
          />
        </div>

        <div className="w-72 border-l bg-background p-4">
          <h3 className="mb-4 text-sm font-medium">Tools</h3>

          <div className="space-y-1">
            <Button
              variant={activeTool === "trim" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() =>
                setActiveTool(activeTool === "trim" ? null : "trim")
              }
            >
              <Scissors className="mr-2 h-4 w-4" />
              Trim
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Current Time</p>
              <p className="text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Play
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="mr-2 h-4 w-4" />
                    Unmute
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-4 w-4" />
                    Mute
                  </>
                )}
              </Button>
            </div>
          </div>

          {activeTool === "trim" && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Trim Controls
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={resetTrim}
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Reset
                </Button>
              </div>

              <div className="relative h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute h-full rounded-full bg-primary/30"
                  style={{
                    left: `${(trim.startTime / duration) * 100}%`,
                    width: `${((trim.endTime - trim.startTime) / duration) * 100}%`,
                  }}
                />
                <div
                  className="absolute h-full rounded-full bg-primary"
                  style={{
                    left: `${(trim.startTime / duration) * 100}%`,
                    width: `${Math.min(trimProgress, 100)}%`,
                  }}
                />
                <div
                  className="absolute h-full w-0.5 bg-white shadow"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatTime(trim.startTime)}</span>
                <span className="font-medium text-foreground">
                  {formatTime(trimmedDuration)}
                </span>
                <span>{formatTime(trim.endTime)}</span>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={setTrimStart}
                  >
                    <SkipBack className="mr-1 h-3 w-3" />
                    Set Start
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={setTrimEnd}
                  >
                    Set End
                    <SkipForward className="ml-1 h-3 w-3" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={skipToStart}
                  >
                    Go to Start
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={skipToEnd}
                  >
                    Go to End
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
