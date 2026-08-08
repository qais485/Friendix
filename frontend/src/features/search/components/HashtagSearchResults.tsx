import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Hash, Users, FileText } from "lucide-react";
import type { Hashtag } from "@/types";

interface HashtagSearchResultsProps {
  hashtags: Hashtag[];
}

export function HashtagSearchResults({ hashtags }: HashtagSearchResultsProps) {
  if (hashtags.length === 0) return null;

  return (
    <div className="space-y-2">
      {hashtags.map((hashtag, i) => (
        <motion.div
          key={hashtag.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          <Link
            to={`/hashtags/${hashtag.name}`}
            className="flex items-center gap-3 rounded-2xl glass-card p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Hash className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">#{hashtag.name}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {hashtag.posts_count} posts
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {hashtag.followers_count} followers
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
