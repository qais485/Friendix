import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const EMOJIS = [
  "😀","😄","😁","😂","🤣","😊","😍","🥰","😘","😎",
  "🤩","😜","🤔","🙃","😴","😢","😭","😤","😡","🤯",
  "🥳","😇","🤗","🤭","🙄","😳","🥺","😱","🤠","😈",
  "👍","👎","👏","🙏","💪","👋","🤝","👌","✌️","🤞",
  "❤️","🧡","💛","💚","💙","💜","🖤","💯","🔥","✨",
  "🎉","🎊","🌈","☀️","🌙","⭐","🍀","⚡","💥","🎯",
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl glass-card p-2 shadow-lg"
    >
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="text-xs font-medium text-muted-foreground">Emoji</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 transition-colors hover:bg-muted"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-8 gap-0.5">
        {EMOJIS.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            type="button"
            onClick={() => onSelect(emoji)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg text-base transition-colors hover:bg-muted"
            )}
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
