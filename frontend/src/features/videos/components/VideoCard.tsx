import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Clock, Eye, MoreVertical, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { Video } from "@/types/videos";

interface VideoCardProps {
  video: Video;
  index?: number;
  showOwnerMenu?: boolean;
  onDelete?: (id: string) => void;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export function VideoCard({ video, index = 0, showOwnerMenu = false, onDelete }: VideoCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="group"
    >
      <Link to={`/watch/${video.id}`} className="block">
        <div className="relative overflow-hidden rounded-xl bg-muted">
          {video.thumbnail_url ? (
            <OptimizedImage
              src={video.thumbnail_url}
              alt={video.title}
              preset="thumbnail"
              className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Play className="h-12 w-12 text-primary/40" />
            </div>
          )}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            <Clock className="h-3 w-3" />
            {formatDuration(video.duration)}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg">
              <Play className="h-5 w-5 fill-current" />
            </div>
          </div>
        </div>
      </Link>

      <div className="mt-3 flex gap-3">
        {video.user && (
          <Link to={`/profile/${video.user.username}`} className="shrink-0">
            {video.user.avatar_url ? (
              <OptimizedImage
                src={video.user.avatar_url}
                alt=""
                preset="avatar"
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {(video.user.full_name || "U")[0].toUpperCase()}
              </div>
            )}
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${video.id}`}>
            <h3 className="line-clamp-2 break-words text-sm font-semibold leading-snug">{video.title}</h3>
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            {video.user?.full_name || video.user?.username || "Unknown"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViews(video.views_count)} views
            </span>
            <span>{timeAgo(video.created_at)}</span>
          </div>
        </div>

        {showOwnerMenu && (
          <div className="relative shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 w-40 max-w-[calc(100vw-2rem)] rounded-2xl glass-card p-1.5">
                <Link
                  to={`/watch/${video.id}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  <Play className="h-4 w-4" /> Watch
                </Link>
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  <Edit className="h-4 w-4" /> Edit
                </button>
                {onDelete && (
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                    onClick={() => { onDelete(video.id); setMenuOpen(false); }}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
