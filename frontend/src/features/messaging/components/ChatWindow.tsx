import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useMessagingStore } from "@/store/messagingStore";
import { useMessages, useSendMessage, useMarkAsRead, useAddReaction, useForwardMessage, useConversations } from "../hooks";
import { ChatHeader } from "./ChatHeader";
import { MessageInput } from "./MessageInput";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ConversationSearch } from "./ConversationSearch";
import { Avatar } from "@/components/ui/avatar";
import api from "@/services/api";
import type { Message, Conversation } from "@/types";

interface ChatWindowProps {
  conversationId: string;
  onBack: () => void;
}

export function ChatWindow({ conversationId, onBack }: ChatWindowProps) {
  const { user } = useAuthStore();
  const { typingUsers, sendWsMessage } = useMessagingStore();
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const { data: conversation } = useQuery({
    queryKey: ["messaging", "conversation", conversationId],
    queryFn: async () => {
      const { data } = await api.get(`/messaging/conversations/${conversationId}`);
      return data;
    },
    enabled: !!conversationId,
  });
  const sendMessage = useSendMessage(conversationId);
  const markAsRead = useMarkAsRead();
  const addReaction = useAddReaction();
  const forwardMessage = useForwardMessage();
  const { data: conversations = [] } = useConversations();

  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [forwardMessage_, setForwardMessage] = useState<Message | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const conversationTypingUsers = typingUsers.filter(
    (t) => t.conversation_id === conversationId && t.user_id !== user?.id
  );

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender_id !== user?.id) {
        markAsRead.mutate(lastMsg.id);
      }
    }
  }, [messages, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, conversationTypingUsers]);

  const handleSendMessage = useCallback(
    (content: string, type = "text", mediaUrl?: string, fileName?: string, fileSize?: number, mimeType?: string, duration?: number) => {
      sendMessage.mutate(
        {
          content,
          message_type: type,
          media_url: mediaUrl,
          file_name: fileName,
          file_size: fileSize,
          mime_type: mimeType,
          duration,
        },
        {
          onSuccess: () => {
            sendWsMessage({
              type: "message",
              conversation_id: conversationId,
              content,
              message_type: type,
              media_url: mediaUrl,
              file_name: fileName,
              file_size: fileSize,
              mime_type: mimeType,
              duration,
            });
          },
        }
      );
    },
    [sendMessage, sendWsMessage, conversationId]
  );

  const handleReact = useCallback(
    (_messageId: string, emoji: string) => {
      addReaction.mutate({ messageId: _messageId, emoji });
      sendWsMessage({
        type: "reaction",
        message_id: _messageId,
        emoji,
      });
    },
    [addReaction, sendWsMessage]
  );

  const handleReply = useCallback((message: Message) => {
    setReplyTo(message);
  }, []);

  const handleForward = useCallback((message: Message) => {
    setForwardMessage(message);
  }, []);

  const handleForwardToConversation = useCallback((targetConversationId: string) => {
    if (!forwardMessage_) return;
    forwardMessage.mutate(
      { messageId: forwardMessage_.id, conversationId: targetConversationId },
      {
        onSuccess: () => {
          sendWsMessage({
            type: "message",
            conversation_id: targetConversationId,
            content: forwardMessage_.content,
            message_type: forwardMessage_.message_type || "text",
          });
          setForwardMessage(null);
        },
      }
    );
  }, [forwardMessage, forwardMessage_, sendWsMessage]);

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50">
          <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
        </div>
        <p className="mt-4 text-lg font-medium text-foreground">
          Select a conversation
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Choose from your existing chats or start a new one
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {showSearch && conversationId && (
        <ConversationSearch
          conversationId={conversationId}
          onSelectMessage={() => {
            setShowSearch(false);
          }}
          onClose={() => setShowSearch(false)}
        />
      )}

      <ChatHeader conversation={conversation} onBack={onBack} />

      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
              <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => {
              const isOwn = msg.sender_id === user?.id;
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const showSender = !prevMsg || prevMsg.sender_id !== msg.sender_id;

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={isOwn}
                  showSender={showSender}
                  onReply={handleReply}
                  onReact={handleReact}
                  onForward={handleForward}
                  onEdit={(_messageId, content) => {
                    sendWsMessage({
                      type: "edit_message",
                      message_id: _messageId,
                      content,
                    });
                  }}
                />
              );
            })}

            <AnimatePresence>
              {conversationTypingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <TypingIndicator
                    username={conversationTypingUsers.map((t) => t.username || "Someone").join(", ")}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        replyTo={replyTo}
        onClearReply={() => setReplyTo(null)}
        conversationId={conversationId}
      />

      <AnimatePresence>
        {forwardMessage_ && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl glass-card p-4 shadow-float"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold">Forward Message</h3>
                <button
                  onClick={() => setForwardMessage(null)}
                  className="rounded-full p-1 hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-3 rounded-xl bg-muted/50 p-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {forwardMessage_.sender_name}
                </p>
                <p className="line-clamp-2 text-sm">{forwardMessage_.content}</p>
              </div>
              <div className="max-h-60 space-y-1 overflow-y-auto scrollbar-thin">
                {conversations.map((conv: Conversation) => (
                  <button
                    key={conv.id}
                    onClick={() => handleForwardToConversation(conv.id)}
                    className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <Avatar
                      src={conv.is_group ? conv.group_photo_url : conv.members?.[0]?.avatar_url}
                      alt={conv.title || "Chat"}
                      fallback={conv.is_group ? "G" : conv.members?.[0]?.username?.[0]?.toUpperCase() || "?"}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {conv.title || conv.members?.map((m) => m.username).join(", ") || "Chat"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
