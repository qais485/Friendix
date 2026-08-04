import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import type { HashtagPost } from "@/types";

interface HashtagPostCardProps {
  post: HashtagPost;
  index?: number;
}

export function HashtagPostCard({ post, index = 0 }: HashtagPostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link
        to="/"
        className="block rounded-2xl glass-card p-4 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          {post.user_avatar ? (
            <img
              src={post.user_avatar}
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {(post.username || "U")[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm">
              {post.username || "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at))}
            </p>
          </div>
        </div>
        {post.content && (
          <p className="mt-3 text-sm line-clamp-4 whitespace-pre-wrap">
            {post.content}
          </p>
        )}
        {post.image_urls && (() => {
          const urls = post.image_urls.split(",").filter(Boolean);
          return urls.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-lg">
              <img
                src={urls[0].trim()}
                alt=""
                className="w-full max-h-64 object-cover"
              />
            </div>
          );
        })()}
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {post.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {post.comments_count}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
