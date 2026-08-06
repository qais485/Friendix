import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroupMessages, useSendGroupMessage } from "../hooks";
import { formatDistanceToNow } from "@/lib/utils";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";
import type { Group, GroupMessage } from "@/types";

interface GroupChatProps {
  group: Group;
}

export function GroupChat({ group }: GroupChatProps) {
  const { data: messages, isPending } = useGroupMessages(group.slug);
  const sendMutation = useSendGroupMessage();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMutation.mutate(
      { slug: group.slug, content: input.trim() },
      { onSuccess: () => setInput("") }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isPending) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {!messages || messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
          </div>
        ) : (
          [...messages].reverse().map((msg: GroupMessage) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.is_announcement ? "bg-primary/5 rounded-xl p-3 border border-primary/20" : ""}`}
            >
              {msg.avatar_url ? (
                <img
                  src={getCloudinaryTransformedUrl(msg.avatar_url, "avatar")}
                  alt=""
                  width={32}
                  height={32}
                  loading="lazy"
                  decoding="async"
                  className="h-8 w-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {(msg.username || "U")[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{msg.username}</span>
                  {msg.is_announcement && (
                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      <Megaphone className="h-2.5 w-2.5" />
                      Announcement
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(msg.created_at))}
                  </span>
                </div>
                <p className="mt-0.5 text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {group.is_member && (
        <div className="border-t p-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!input.trim() || sendMutation.isPending}
              className="shrink-0"
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
