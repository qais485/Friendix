import { useState, useRef, useEffect } from "react";
import { useChatMessages, useSendChatMessage } from "../hooks";
import { useToast } from "@/hooks/useToast";
import { Send } from "lucide-react";
import type { LiveChatMessage } from "@/types";

interface LiveChatProps {
  streamId: string;
  isHost: boolean;
  isModerator: boolean;
  allowChat: boolean;
}

export function LiveChat({ streamId, allowChat }: LiveChatProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { data: chatData, fetchNextPage, hasNextPage, isFetchingNextPage } = useChatMessages(streamId);
  const sendMessage = useSendChatMessage();

  const messages = chatData?.pages.flatMap((page) => page.messages) ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessage.isPending) return;
    try {
      await sendMessage.mutateAsync({ streamId, data: { content: message.trim() } });
      setMessage("");
    } catch {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  return (
    <div className="flex h-[320px] flex-col overflow-hidden rounded-2xl glass-card sm:h-[400px]">
      <div className="border-b px-4 py-3">
        <h3 className="font-bold">Live Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isFetchingNextPage && (
          <div className="text-center text-xs text-muted-foreground py-2">Loading older messages...</div>
        )}
        {hasNextPage && !isFetchingNextPage && (
          <button onClick={handleLoadMore} className="w-full text-center text-sm text-primary hover:underline py-2">
            Load older messages
          </button>
        )}
        {messages.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">No messages yet. Start the conversation!</div>
        )}
        {messages.map((msg: LiveChatMessage) => (
          <div key={msg.id} className="flex gap-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {msg.user?.username?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="min-w-0 truncate text-sm font-semibold">{msg.user?.display_name || msg.user?.username || "Anonymous"}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="break-words text-sm text-muted-foreground">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {allowChat ? (
        <form onSubmit={handleSend} className="border-t p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-xl bg-muted px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
              disabled={sendMessage.isPending}
            />
            <button
              type="submit"
              disabled={!message.trim() || sendMessage.isPending}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="border-t px-3 py-3 text-center text-sm text-muted-foreground">Chat is disabled</div>
      )}
    </div>
  );
}
