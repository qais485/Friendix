import { motion } from "framer-motion";
import { useAddStoryReaction, useRemoveStoryReaction } from "../hooks";

interface StoryReactionsProps {
  storyId: string;
  userId: string;
  currentReaction?: string | null;
}

const QUICK_REACTIONS = ["❤️", "😂", "😮", "😢", "😡", "👍", "🔥", "💯"];

export function StoryReactions({ storyId, userId: _userId, currentReaction }: StoryReactionsProps) {
  const addReaction = useAddStoryReaction();
  const removeReaction = useRemoveStoryReaction();

  const handleReaction = (emoji: string) => {
    if (currentReaction === emoji) {
      removeReaction.mutate(storyId);
    } else {
      addReaction.mutate({ storyId, data: { emoji } });
    }
  };

  return (
    <div className="flex items-center gap-1">
      {QUICK_REACTIONS.map((emoji) => (
        <motion.button
          key={emoji}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleReaction(emoji)}
          className={`rounded-full p-1.5 text-lg transition-colors ${
            currentReaction === emoji
              ? "bg-primary/20 ring-2 ring-primary"
              : "hover:bg-white/10"
          }`}
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
}
