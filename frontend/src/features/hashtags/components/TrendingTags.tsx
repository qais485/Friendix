import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Hash } from "lucide-react";
import { useTrendingHashtags } from "../hooks";
import { FollowButton } from "./FollowButton";

export function TrendingTags() {
  const { data: trending, isPending } = useTrendingHashtags(10);

  if (isPending) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (!trending || trending.length === 0) {
    return (
      <div className="rounded-2xl glass-card p-8 text-center">
        <Hash className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">
          No trending hashtags yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold">Trending Hashtags</h3>
      </div>
      {trending.map((tag, i) => (
        <motion.div
          key={tag.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          <div className="flex items-center gap-3 rounded-2xl glass-card p-3 transition-colors hover:bg-muted/50">
            <Link
              to={`/hashtags/${tag.name}`}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Hash className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate">#{tag.name}</p>
                <p className="text-xs text-muted-foreground">
                  {tag.posts_count} {tag.posts_count === 1 ? "post" : "posts"} · {tag.followers_count} {tag.followers_count === 1 ? "follower" : "followers"}
                </p>
              </div>
            </Link>
            <span className="shrink-0">
              <FollowButton hashtagName={tag.name} isFollowing={tag.is_following} size="sm" />
            </span>
          </div>
        </motion.div>
      ))}
      <Link
        to="/hashtags"
        className="block rounded-xl py-2 text-center text-sm font-medium text-primary hover:underline"
      >
        See all hashtags
      </Link>
    </div>
  );
}
