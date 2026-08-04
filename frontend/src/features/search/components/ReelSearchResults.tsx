import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import type { SearchResultReel } from "@/types/search";

interface ReelSearchResultsProps {
  reels: SearchResultReel[];
}

export function ReelSearchResults({ reels }: ReelSearchResultsProps) {
  if (reels.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {reels.map((reel) => (
        <motion.div
          key={reel.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Link
            to={`/reels/${reel.id}`}
            className="group relative block aspect-[9/16] overflow-hidden rounded-xl bg-muted"
          >
            {reel.video_url ? (
              <video
                src={reel.video_url}
                className="h-full w-full object-cover"
                muted
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <Play className="h-8 w-8 text-muted-foreground/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <div className="flex items-center gap-1.5">
                {reel.user_avatar ? (
                  <img
                    src={reel.user_avatar}
                    alt=""
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">
                    {(reel.username || "U")[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-medium text-white truncate">
                  @{reel.username}
                </span>
              </div>
              {reel.description && (
                <p className="mt-1 text-xs text-white/80 line-clamp-2">
                  {reel.description}
                </p>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
