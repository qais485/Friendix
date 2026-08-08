import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import type { FriendDetail } from "@/types";

interface FriendSuggestionsProps {
  suggestions: FriendDetail[];
  isLoading: boolean;
  onAddFriend?: (userId: string) => void;
  isProcessing?: boolean;
}

export function FriendSuggestions({ suggestions, isLoading, onAddFriend, isProcessing }: FriendSuggestionsProps) {
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
            <div className="h-8 w-20 rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed glass-card py-16 text-center transition-all duration-200 hover:shadow-elevated">
        <UserPlus className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-4 font-bold">No suggestions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {suggestions.map((suggestion) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between rounded-2xl glass-card p-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-elevated"
          >
            <div className="flex items-center gap-3">
              <Avatar
                src={suggestion.avatar_url}
                alt={suggestion.full_name || "User"}
                fallback={suggestion.full_name?.charAt(0) || "?"}
                size="md"
                showRing={false}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-semibold">{suggestion.full_name || "Unknown User"}</p>
                  {suggestion.is_verified && (
                    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">✓</span>
                  )}
                </div>
                {suggestion.username && <p className="truncate text-xs text-muted-foreground">@{suggestion.username}</p>}
                {suggestion.mutual_friends_count > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {suggestion.mutual_friends_count} mutual friend{suggestion.mutual_friends_count !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <Button size="sm" className="shrink-0 rounded-xl transition-all duration-200 hover:shadow-card" onClick={() => onAddFriend?.(suggestion.id)} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="mr-1.5 h-4 w-4" /> Add</>}
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
