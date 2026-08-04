import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Trash2,
  Music,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMediaDisplayUrl, useSecureMediaUrl } from "@/lib/media";
import { formatFileSize } from "@/utils";
import type { Media } from "@/types";

interface MediaViewerProps {
  media: Media[];
  initialIndex?: number;
  onClose: () => void;
  onDelete?: (mediaId: string) => void;
  onEdit?: (media: Media) => void;
  isOwner?: boolean;
}

export function MediaViewer({
  media,
  initialIndex = 0,
  onClose,
  onDelete,
  onEdit,
  isOwner = false,
}: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentMedia = media[currentIndex];
  const secureUrl = useSecureMediaUrl(currentMedia, "modal");

  const goNext = useCallback(() => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, media.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onClose]);

  if (!currentMedia) return null;

  const renderContent = () => {
    if (
      currentMedia.media_type === "image" ||
      currentMedia.media_type === "live_photo"
    ) {
      return (
        <img
          src={secureUrl || undefined}
          alt={currentMedia.alt_text || currentMedia.original_name || "Media"}
          width={currentMedia.width || 1200}
          height={currentMedia.height || 900}
          decoding="async"
          className="max-h-[80vh] max-w-full object-contain"
        />
      );
    }

    if (currentMedia.media_type === "video") {
      return (
        <video
          src={secureUrl || undefined}
          className="max-h-[80vh] max-w-full rounded-lg"
          controls
          autoPlay
          preload="auto"
        />
      );
    }

    if (currentMedia.media_type === "audio") {
      return (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-muted p-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Music className="h-12 w-12 text-primary" />
          </div>
          <audio src={secureUrl || undefined} controls className="w-full max-w-md" />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-muted p-8">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <Film className="h-12 w-12 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          {currentMedia.original_name || "Document"}
        </p>
        <Button asChild>
          <a href={getMediaDisplayUrl(currentMedia)} download target="_blank" rel="noreferrer">
            <Download className="mr-2 h-4 w-4" />
            Download
          </a>
        </Button>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-black/95"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <p className="text-sm text-white/80">
              {currentIndex + 1} / {media.length}
            </p>
            {currentMedia.original_name && (
              <p className="text-sm text-white/50">
                {currentMedia.original_name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentMedia.file_size && (
              <span className="text-xs text-white/40">
                {formatFileSize(currentMedia.file_size)}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() =>
                window.open(getMediaDisplayUrl(currentMedia), "_blank")
              }
            >
              <Download className="h-4 w-4" />
            </Button>
            {isOwner && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => onEdit(currentMedia)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {isOwner && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => {
                  onDelete(currentMedia.id);
                  onClose();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 z-10 text-white hover:bg-white/20"
              onClick={goPrev}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentMedia.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center px-16"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>

          {currentIndex < media.length - 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 z-10 text-white hover:bg-white/20"
              onClick={goNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}
        </div>

        {currentMedia.caption && (
          <div className="px-4 py-3 text-center">
            <p className="text-sm text-white/80">{currentMedia.caption}</p>
          </div>
        )}

        <div className="flex justify-center gap-1 px-4 pb-4">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === currentIndex
                  ? "w-8 bg-white"
                  : "w-1.5 bg-white/30 hover:bg-white/50"
              )}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
