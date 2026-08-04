import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Heart, Star, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import type { FriendDetail, CloseFriendDetail } from "@/types";

interface FriendListProps {
  friends: (FriendDetail | CloseFriendDetail)[];
  isLoading: boolean;
  onRemove?: (friendId: string) => void;
  onToggleFavorite?: (friendId: string, isFavorite: boolean) => void;
  onToggleCloseFriend?: (friendId: string, isCloseFriend: boolean) => void;
  showFavoriteButton?: boolean;
  isProcessing?: boolean;
}

export function FriendList({ friends, isLoading, onRemove, onToggleFavorite, onToggleCloseFriend, showFavoriteButton = true, isProcessing }: FriendListProps) {
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-3 rounded-2xl border p-4 shadow-card">
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

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed glass-card py-16 text-center transition-all duration-200 hover:shadow-elevated">
        <UserPlus className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-4 font-bold">No friends yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Send friend requests to connect with others.</p>
      </div>
    );
  }

  const isCloseFriend = (friend: FriendDetail | CloseFriendDetail): boolean => {
    return "is_close_friend" in friend ? friend.is_close_friend : true;
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {friends.map((friend) => (
          <motion.div
            key={friend.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between rounded-2xl glass-card p-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-elevated"
          >
            <div className="flex items-center gap-3">
              <Avatar
                src={friend.avatar_url}
                alt={friend.full_name || "User"}
                fallback={friend.full_name?.charAt(0) || "?"}
                size="md"
                showRing={false}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-semibold">{friend.full_name || "Unknown User"}</p>
                  {friend.is_verified && (
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">✓</span>
                  )}
                  {isCloseFriend(friend) && (
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] text-white">★</span>
                  )}
                </div>
                {friend.username && <p className="truncate text-xs text-muted-foreground">@{friend.username}</p>}
                {"mutual_friends_count" in friend && friend.mutual_friends_count > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {friend.mutual_friends_count} mutual friend{friend.mutual_friends_count !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              {showFavoriteButton && onToggleFavorite && "is_favorite" in friend && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 w-9 rounded-full p-0",
                    friend.is_favorite ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-yellow-500"
                  )}
                  onClick={() => onToggleFavorite(friend.id, !friend.is_favorite)}
                >
                  <Heart className="h-4 w-4" fill={friend.is_favorite ? "currentColor" : "none"} />
                </Button>
              )}
              {onToggleCloseFriend && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 w-9 rounded-full p-0",
                    isCloseFriend(friend) ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground hover:text-blue-500"
                  )}
                  onClick={() => onToggleCloseFriend(friend.id, isCloseFriend(friend))}
                >
                  <Star className="h-4 w-4" fill={isCloseFriend(friend) ? "currentColor" : "none"} />
                </Button>
              )}
              {onRemove && (
                <>
                  {confirmRemove === friend.id ? (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 rounded-full p-0 text-destructive hover:text-destructive"
                        onClick={() => {
                          onRemove(friend.id);
                          setConfirmRemove(null);
                        }}
                        disabled={isProcessing}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 rounded-full p-0 text-muted-foreground"
                        onClick={() => setConfirmRemove(null)}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 rounded-full p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setConfirmRemove(friend.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
