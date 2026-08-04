import { useState, useCallback } from "react";
import { useSendReaction } from "../hooks";
import { useToast } from "@/hooks/useToast";

interface LiveReactionsProps {
  streamId: string;
  allowReactions: boolean;
}

const EMOJI_OPTIONS = ["❤️", "🔥", "👍", "😂", "😮", "😢"];

export function LiveReactions({ streamId, allowReactions }: LiveReactionsProps) {
  const { toast } = useToast();
  const sendReaction = useSendReaction();
  const [floatingReactions, setFloatingReactions] = useState<
    { id: string; emoji: string; x: number; y: number }[]
  >([]);

  const handleReaction = useCallback(
    async (emoji: string) => {
      if (!allowReactions || sendReaction.isPending) return;

      try {
        await sendReaction.mutateAsync({
          streamId,
          data: { emoji },
        });

        const newReaction = {
          id: `${Date.now()}-${Math.random()}`,
          emoji,
          x: Math.random() * 80 + 10,
          y: 100,
        };
        setFloatingReactions((prev) => [...prev, newReaction]);

        setTimeout(() => {
          setFloatingReactions((prev) =>
            prev.filter((r) => r.id !== newReaction.id)
          );
        }, 3000);
      } catch {
        toast({
          title: "Error",
          description: "Failed to send reaction",
          variant: "destructive",
        });
      }
    },
    [streamId, allowReactions, sendReaction, toast]
  );

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingReactions.map((reaction) => (
          <div
            key={reaction.id}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${reaction.x}%`,
              bottom: `${reaction.y}%`,
              animation: "float-up 3s ease-out forwards",
            }}
          >
            {reaction.emoji}
          </div>
        ))}
      </div>

      {allowReactions && (
        <div className="flex gap-2 justify-center">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              disabled={sendReaction.isPending}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-xl transition-colors disabled:opacity-50"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) scale(1.5);
          }
        }
      `}</style>
    </div>
  );
}
