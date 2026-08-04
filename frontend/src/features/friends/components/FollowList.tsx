import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, UserMinus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FollowUser } from "@/types";

interface FollowListProps {
  users: FollowUser[];
  isLoading: boolean;
  type: "followers" | "following";
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  isProcessing?: boolean;
}

export function FollowList({ users, isLoading, type, onFollow, onUnfollow, isProcessing }: FollowListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-3 rounded-2xl border p-4">
            <div className="h-12 w-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded-lg bg-muted" />
              <div className="h-3 w-24 rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 py-16 text-center">
        <UserPlus className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-4 font-bold">
          {type === "followers" ? "No followers yet" : "Not following anyone"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {users.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between rounded-2xl glass-card p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || "User"}
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  <UserPlus className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-semibold">{user.full_name || "Unknown User"}</p>
                  {user.is_verified && (
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">✓</span>
                  )}
                  {user.is_friend && (
                    <span className="inline-flex h-4 items-center gap-0.5 rounded-full bg-green-500/15 px-1.5 text-[10px] font-medium text-green-600">
                      <Users className="h-2.5 w-2.5" /> Friend
                    </span>
                  )}
                </div>
                {user.username && <p className="truncate text-xs text-muted-foreground">@{user.username}</p>}
                {user.bio && <p className="truncate text-xs text-muted-foreground">{user.bio}</p>}
                {user.mutual_friends_count > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {user.mutual_friends_count} mutual friend{user.mutual_friends_count !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            {type === "followers" ? (
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => onFollow?.(user.id)} disabled={isProcessing}>
                <UserPlus className="mr-1.5 h-4 w-4" /> Follow
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => onUnfollow?.(user.id)} disabled={isProcessing}>
                <UserMinus className="mr-1.5 h-4 w-4" /> Unfollow
              </Button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
