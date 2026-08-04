import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { useUpdateConversation } from "../hooks";

const THEMES = [
  { id: "default", name: "Default", bg: "bg-background", bubble: "bg-primary", preview: "#3b82f6" },
  { id: "ocean", name: "Ocean", bg: "bg-blue-50", bubble: "bg-blue-500", preview: "#3b82f6" },
  { id: "forest", name: "Forest", bg: "bg-green-50", bubble: "bg-green-600", preview: "#16a34a" },
  { id: "sunset", name: "Sunset", bg: "bg-orange-50", bubble: "bg-orange-500", preview: "#f97316" },
  { id: "lavender", name: "Lavender", bg: "bg-purple-50", bubble: "bg-purple-500", preview: "#a855f7" },
  { id: "rose", name: "Rose", bg: "bg-pink-50", bubble: "bg-pink-500", preview: "#ec4899" },
  { id: "midnight", name: "Midnight", bg: "bg-slate-900", bubble: "bg-indigo-500", preview: "#6366f1" },
  { id: "dark", name: "Dark", bg: "bg-gray-900", bubble: "bg-gray-600", preview: "#4b5563" },
];

interface ChatThemeSelectorProps {
  conversationId: string;
  currentTheme: string;
  onClose: () => void;
}

export function ChatThemeSelector({ conversationId, currentTheme, onClose }: ChatThemeSelectorProps) {
  const [selected, setSelected] = useState(currentTheme);
  const updateConversation = useUpdateConversation(conversationId);

  const handleApply = () => {
    updateConversation.mutate(
      { chat_theme: selected },
      { onSuccess: onClose }
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl border bg-background p-6 shadow-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Chat Theme</h3>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 grid grid-cols-4 gap-3">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelected(theme.id)}
                className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
                  selected === theme.id
                    ? "border-primary"
                    : "border-transparent hover:border-muted-foreground/20"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: theme.preview }}>
                  {selected === theme.id && (
                    <Check className="h-5 w-5 text-white" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{theme.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleApply}
            disabled={updateConversation.isPending}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {updateConversation.isPending ? "Applying..." : "Apply Theme"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
