import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Hash, Users, FileText } from "lucide-react";
import { FollowButton } from "./FollowButton";
import type { Hashtag, TrendingHashtag } from "@/types";

interface HashtagCardProps {
  hashtag: Hashtag | TrendingHashtag;
  index?: number;
}

export function HashtagCard({ hashtag, index = 0 }: HashtagCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link
        to={`/hashtags/${hashtag.name}`}
        className="block rounded-2xl glass-card p-4 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Hash className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold">#{hashtag.name}</p>
            {hashtag.description && (
              <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                {hashtag.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {hashtag.posts_count} {hashtag.posts_count === 1 ? "post" : "posts"}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {hashtag.followers_count} {hashtag.followers_count === 1 ? "follower" : "followers"}
              </span>
            </div>
          </div>
          <FollowButton
            hashtagName={hashtag.name}
            isFollowing={hashtag.is_following}
            size="sm"
          />
        </div>
      </Link>
    </motion.div>
  );
}
