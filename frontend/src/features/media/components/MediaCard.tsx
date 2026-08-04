import { useState } from "react";
import { motion } from "framer-motion";
import {
  Image,
  Film,
  Music,
  FileText,
  Camera,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMediaDisplayUrl, useSecureMediaUrl } from "@/lib/media";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";
import { formatFileSize } from "@/utils";
import type { Media } from "@/types";

interface MediaCardProps {
  media: Media;
  onDelete?: (mediaId: string) => void;
  onEdit?: (media: Media) => void;
  onClick?: (media: Media) => void;
  isOwner?: boolean;
  showActions?: boolean;
}

const TYPE_ICONS: Record<string, typeof Image> = {
  image: Image,
  video: Film,
  audio: Music,
  document: FileText,
  live_photo: Camera,
};

const TYPE_COLORS: Record<string, string> = {
  image: "from-blue-500/20 to-purple-500/20",
  video: "from-red-500/20 to-orange-500/20",
  audio: "from-purple-500/20 to-pink-500/20",
  document: "from-gray-500/20 to-slate-500/20",
  live_photo: "from-green-500/20 to-teal-500/20",
};

export function MediaCard({
  media,
  onDelete,
  onEdit,
  onClick,
  isOwner = false,
  showActions = true,
}: MediaCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const secureUrl = useSecureMediaUrl(media, "thumbnail");

  const Icon = TYPE_ICONS[media.media_type] || Image;
  const gradient = TYPE_COLORS[media.media_type] || TYPE_COLORS.image;

  const renderPreview = () => {
    if (media.media_type === "image" || media.media_type === "live_photo") {
      const imgSrc = media.thumbnail_url || secureUrl;
      return (
        <div className="relative h-full w-full">
          {imgSrc ? (
            <img
              src={getCloudinaryTransformedUrl(imgSrc, "thumbnail")}
              alt={media.alt_text || media.original_name || "Media"}
              width={200}
              height={200}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/30">
              <Image className="h-8 w-8 text-muted-foreground/50" />
            </div>
          )}
          {media.media_type === "live_photo" && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
              <Camera className="h-3 w-3" />
              Live
            </div>
          )}
        </div>
      );
    }

    if (media.media_type === "video") {
      return (
        <div className="relative h-full w-full bg-black">
          {media.thumbnail_url ? (
            <img
              src={media.thumbnail_url}
              alt="Video thumbnail"
              width={200}
              height={200}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Film className="h-8 w-8 text-white/50" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110">
              <Film className="h-5 w-5 text-white" />
            </div>
          </div>
          {media.duration && (
            <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
              {Math.floor(media.duration / 60)}:
              {String(Math.floor(media.duration % 60)).padStart(2, "0")}
            </span>
          )}
        </div>
      );
    }

    if (media.media_type === "audio") {
      return (
        <div
          className={cn(
            "flex h-full w-full flex-col items-center justify-center bg-gradient-to-br p-4",
            gradient
          )}
        >
          <Music className="h-8 w-8 text-primary" />
          {media.duration && (
            <span className="mt-2 text-xs text-muted-foreground">
              {Math.floor(media.duration / 60)}:
              {String(Math.floor(media.duration % 60)).padStart(2, "0")}
            </span>
          )}
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-gradient-to-br",
          gradient
        )}
      >
        <FileText className="h-8 w-8 text-muted-foreground/50" />
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl glass-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className="aspect-square cursor-pointer overflow-hidden"
        onClick={() => onClick?.(media)}
      >
        {renderPreview()}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {media.original_name || `${media.media_type} file`}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Icon className="h-3 w-3" />
              <span className="capitalize">{media.media_type.replace("_", " ")}</span>
              {media.file_size && (
                <>
                  <span>·</span>
                  <span>{formatFileSize(media.file_size)}</span>
                </>
              )}
            </div>
            {media.caption && (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {media.caption}
              </p>
            )}
          </div>

          {showActions && isOwner && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-lg border bg-background shadow-lg">
                    <button
                      onClick={() => {
                        onClick?.(media);
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                    <button
                      onClick={() => {
                        window.open(getMediaDisplayUrl(media), "_blank");
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit(media);
                          setShowMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(media.id);
                          setShowMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-muted transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
