import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trash2,
  Edit,
  Bookmark,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { Reel } from "@/types";

interface ReelPlayerProps {
  reel: Reel;
  isOwner?: boolean;
  onLike?: (reelId: string) => void;
  onComment?: (reelId: string) => void;
  onShare?: (reelId: string) => void;
  onDelete?: (reelId: string) => void;
  onEdit?: (reel: Reel) => void;
  onSave?: (reelId: string) => void;
}

export function ReelPlayer({
  reel,
  isOwner = false,
  onLike,
  onComment,
  onShare,
  onDelete,
  onEdit,
  onSave,
}: ReelPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (videoRef.current) {
            if (entry.isIntersecting) {
              videoRef.current.play().catch(() => {});
              setIsPlaying(true);
            } else {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative mx-auto max-w-sm overflow-hidden rounded-2xl bg-black shadow-xl"
    >
      <div className="relative aspect-[9/16]">
        <video
          ref={videoRef}
          src={reel.media?.file_url}
          className="h-full w-full object-cover"
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          onClick={togglePlay}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md"
              >
                <Play className="h-10 w-10 text-white fill-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-xs font-bold text-white">
                @{reel.user_id.slice(0, 2)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="absolute inset-x-0 bottom-0 space-y-4 p-4 pb-20">
          <div>
            <p className="text-sm font-medium text-white">
              @{reel.user_id.slice(0, 8)}
            </p>
            {reel.caption && (
              <p className="mt-1 text-sm text-white/80 line-clamp-2">
                {reel.caption}
              </p>
            )}
          </div>

          {reel.audio_name && (
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Music className="h-3 w-3" />
              <span className="truncate">{reel.audio_name}</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-20 right-3 flex flex-col items-center gap-5">
          <Button
            variant="ghost"
            size="sm"
            className="flex h-14 w-14 flex-col items-center gap-1 text-white hover:bg-white/20"
            onClick={() => {
              setIsLiked(!isLiked);
              onLike?.(reel.id);
            }}
          >
            <Heart
              className={cn(
                "h-7 w-7 transition-colors",
                isLiked && "fill-red-500 text-red-500"
              )}
            />
            <span className="text-[10px]">
              {formatCount(reel.likes_count + (isLiked ? 1 : 0))}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex h-14 w-14 flex-col items-center gap-1 text-white hover:bg-white/20"
            onClick={() => onComment?.(reel.id)}
          >
            <MessageCircle className="h-7 w-7" />
            <span className="text-[10px]">
              {formatCount(reel.comments_count)}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex h-14 w-14 flex-col items-center gap-1 text-white hover:bg-white/20"
            onClick={() => onShare?.(reel.id)}
          >
            <Share2 className="h-7 w-7" />
            <span className="text-[10px]">
              {formatCount(reel.shares_count)}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex h-14 w-14 flex-col items-center gap-1 text-white hover:bg-white/20"
            onClick={() => {
              setIsSaved(!isSaved);
              onSave?.(reel.id);
            }}
          >
            <Bookmark
              className={cn(
                "h-7 w-7 transition-colors",
                isSaved && "fill-white"
              )}
            />
          </Button>

          {isOwner && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-14 w-14 text-white hover:bg-white/20"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreHorizontal className="h-7 w-7" />
              </Button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 w-40 overflow-hidden rounded-xl border bg-background shadow-xl"
                  >
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit(reel);
                          setShowMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Reel
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(reel.id);
                          setShowMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-muted transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Reel
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {reel.duration && (
          <div className="absolute bottom-4 left-4 text-xs text-white/60">
            {Math.floor(reel.duration / 60)}:
            {String(Math.floor(reel.duration % 60)).padStart(2, "0")}
          </div>
        )}
      </div>
    </motion.div>
  );
}
