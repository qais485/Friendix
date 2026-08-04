import { Newspaper, Users, TrendingUp, UserPlus } from "lucide-react";
import type { FeedType } from "@/types";

interface EmptyFeedProps {
  feedType: FeedType;
}

const FEED_CONFIG: Record<FeedType, { icon: React.ReactNode; title: string; description: string }> = {
  home: {
    icon: <Newspaper className="h-8 w-8" />,
    title: "No posts yet",
    description: "Follow people or create a post to see content here.",
  },
  following: {
    icon: <Users className="h-8 w-8" />,
    title: "No posts from people you follow",
    description: "Follow more people to see their posts here.",
  },
  friends: {
    icon: <UserPlus className="h-8 w-8" />,
    title: "No posts from friends",
    description: "Add friends to see their posts here.",
  },
  trending: {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "No trending posts",
    description: "Check back later for trending content.",
  },
  suggested: {
    icon: <UserPlus className="h-8 w-8" />,
    title: "No suggestions",
    description: "We'll suggest posts based on your activity.",
  },
};

export function EmptyFeed({ feedType }: EmptyFeedProps) {
  const config = FEED_CONFIG[feedType];

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground/50">
        {config.icon}
      </div>
      <p className="mt-5 text-lg font-semibold">{config.title}</p>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm leading-relaxed">{config.description}</p>
    </div>
  );
}
