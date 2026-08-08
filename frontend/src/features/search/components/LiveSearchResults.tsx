import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { SearchResultLive } from "@/types/search";

interface LiveSearchResultsProps {
  lives: SearchResultLive[];
}

export function LiveSearchResults({ lives }: LiveSearchResultsProps) {
  if (lives.length === 0) return null;

  return (
    <div className="space-y-2">
      {lives.map((live) => (
        <motion.div
          key={live.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            to={`/live/${live.id}`}
            className="flex items-center gap-3 rounded-2xl glass-card p-4 transition-colors hover:bg-muted/50"
          >
            {live.user_avatar ? (
              <OptimizedImage
                src={live.user_avatar}
                alt=""
                preset="avatar"
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {(live.username || "U")[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">
                {live.title || "Untitled Stream"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                @{live.username}
              </p>
            </div>
            {live.is_live && (
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-500">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                Live
              </span>
            )}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
