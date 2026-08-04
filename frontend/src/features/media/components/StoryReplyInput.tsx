import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { useAddStoryReply } from "../hooks";

interface StoryReplyInputProps {
  storyId: string;
  userId: string;
  onReplySent?: () => void;
}

export function StoryReplyInput({ storyId, userId: _userId, onReplySent }: StoryReplyInputProps) {
  const [content, setContent] = useState("");
  const addReply = useAddStoryReply();

  const handleSubmit = async () => {
    if (!content.trim() || addReply.isPending) return;
    await addReply.mutateAsync({ storyId, data: { content: content.trim() } });
    setContent("");
    onReplySent?.();
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Reply to story..."
        className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30"
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        maxLength={1000}
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSubmit}
        disabled={!content.trim() || addReply.isPending}
        className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 disabled:opacity-50"
      >
        {addReply.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </motion.button>
    </div>
  );
}
