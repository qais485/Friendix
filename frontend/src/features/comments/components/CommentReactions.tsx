import { useState } from "react";
import { useToggleCommentReaction } from "../hooks";
import { cn } from "@/lib/utils";
import type { CommentReaction } from "@/types";

interface CommentReactionsProps {
  commentId: string;
  reactions: CommentReaction[];
  hasReacted: boolean;
}

const EMOJI_OPTIONS = ["❤️", "👍", "😂", "😮", "😢", "😡"];

export function CommentReactions({ commentId, reactions, hasReacted }: CommentReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const toggleReaction = useToggleCommentReaction();

  const handleReaction = async (emoji: string) => {
    try { await toggleReaction.mutateAsync({ commentId, data: { emoji } }); } catch {}
    setShowPicker(false);
  };

  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) acc[reaction.emoji] = { emoji: reaction.emoji, count: 0, hasReacted: false };
    acc[reaction.emoji].count++;
    if (reaction.user_id) acc[reaction.emoji].hasReacted = true;
    return acc;
  }, {} as Record<string, { emoji: string; count: number; hasReacted: boolean }>);

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
            hasReacted ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"
          )}
        >
          {hasReacted ? "❤️" : "🤍"} {reactions.length > 0 && reactions.length}
        </button>

        {showPicker && (
          <div className="absolute bottom-full left-0 z-10 mb-2 flex gap-1 rounded-2xl glass-card p-1.5">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors hover:bg-muted"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {Object.values(groupedReactions).map((group) => (
        <button
          key={group.emoji}
          onClick={() => handleReaction(group.emoji)}
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
            group.hasReacted ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"
          )}
        >
          {group.emoji} {group.count}
        </button>
      ))}
    </div>
  );
}
