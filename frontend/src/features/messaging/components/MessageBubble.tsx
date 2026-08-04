import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCheck, Smile, Reply, Pencil, Trash2, Forward, Download, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useMessagingStore } from "@/store/messagingStore";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";
import type { Message, MessageReaction } from "@/types";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender: boolean;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onForward?: (message: Message) => void;
}

export function MessageBubble({ message, isOwn, showSender, onReply, onReact, onEdit, onForward }: MessageBubbleProps) {
  const { user } = useAuthStore();
  const { sendWsMessage } = useMessagingStore();
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || "");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.setSelectionRange(editInputRef.current.value.length, editInputRef.current.value.length);
    }
  }, [isEditing]);

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent !== message.content) {
      sendWsMessage({
        type: "edit_message",
        message_id: message.id,
        content: editContent.trim(),
      });
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    }
    if (e.key === "Escape") {
      setEditContent(message.content || "");
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    sendWsMessage({
      type: "delete_message",
      message_id: message.id,
    });
    setShowActions(false);
  };

  const handleDownload = async () => {
    if (!message.media_url) return;
    try {
      const res = await fetch(message.media_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = message.file_name || message.media_url.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(message.media_url, "_blank");
    }
  };

  const isDeleted = message.is_deleted || message.is_unsent;

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (isDeleted) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
        <div className="rounded-lg bg-muted/50 px-3 py-1.5 text-xs italic text-muted-foreground">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactionPicker(false);
      }}
    >
      <div className={`relative flex max-w-[75%] flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {showSender && !isOwn && message.sender_name && (
          <span className="mb-1 text-xs font-medium text-muted-foreground">
            {message.sender_name}
          </span>
        )}

        <div className="relative">
          {showActions && (
            <div
              className={`absolute top-0 z-10 flex items-center gap-0.5 rounded-full border bg-background shadow-md ${
                isOwn ? "-left-16" : "-right-16"
              }`}
            >
              <button
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="rounded-full p-1.5 hover:bg-muted"
              >
                <Smile className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onReply(message)}
                className="rounded-full p-1.5 hover:bg-muted"
              >
                <Reply className="h-3.5 w-3.5" />
              </button>
              {isOwn && (
                <>
                  <button
                    onClick={() => {
                      setEditContent(message.content || "");
                      setIsEditing(true);
                      setShowActions(false);
                    }}
                    className="rounded-full p-1.5 hover:bg-muted"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="rounded-full p-1.5 hover:bg-muted"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </>
              )}
              <button
                onClick={() => onForward?.(message)}
                className="rounded-full p-1.5 hover:bg-muted"
              >
                <Forward className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {showReactionPicker && (
            <div
              className={`absolute -top-10 z-20 flex gap-1 rounded-full border bg-background px-2 py-1 shadow-lg ${
                isOwn ? "right-0" : "left-0"
              }`}
            >
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(message.id, emoji);
                    setShowReactionPicker(false);
                  }}
                  className="text-lg transition-transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <div
            className={`rounded-2xl px-3 py-2 ${
              isOwn
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            {message.reply_to_id && message.reply_to_preview && (
              <div className={`mb-1 rounded border-l-2 border-primary/50 bg-black/5 px-2 py-1 text-xs ${
                isOwn ? "border-white/30 bg-white/10" : ""
              }`}>
                <span className="font-medium">{message.reply_to_preview.sender_name}</span>
                <p className="truncate opacity-70">{message.reply_to_preview.content}</p>
              </div>
            )}

            {message.message_type === "image" && message.media_url && (
              <div className="relative group/img mb-1">
                <img
                  src={getCloudinaryTransformedUrl(message.media_url, "feed")}
                  alt="Shared image"
                  width={400}
                  height={300}
                  loading="lazy"
                  decoding="async"
                  className="max-h-60 rounded-lg object-cover cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  className="absolute bottom-2 right-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-black/80"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            )}

            {message.message_type === "video" && message.media_url && (
              <video
                src={message.media_url}
                controls
                preload="metadata"
                width={320}
                height={240}
                className="mb-1 max-h-60 rounded-lg"
              />
            )}

            {message.message_type === "audio" && message.media_url && (
              <audio src={message.media_url} controls preload="metadata" className="mb-1 w-48" />
            )}

            {message.message_type === "voice" && message.media_url && (
              <div className="flex items-center gap-2">
                <audio src={message.media_url} controls preload="metadata" className="w-48" />
                {message.duration && (
                  <span className="text-xs opacity-70">{message.duration}s</span>
                )}
              </div>
            )}

            {message.message_type === "file" && (
              <a
                href={message.media_url || "#"}
                download={message.file_name}
                className="flex items-center gap-2 underline"
              >
                <span className="truncate">{message.file_name || "File"}</span>
                {message.file_size && (
                  <span className="text-xs opacity-70">
                    ({(message.file_size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </a>
            )}

            {message.message_type === "gif" && message.media_url && (
              <img
                src={message.media_url}
                alt="GIF"
                width={320}
                height={192}
                loading="lazy"
                decoding="async"
                className="mb-1 max-h-48 rounded-lg"
              />
            )}

            {message.message_type === "sticker" && message.media_url && (
              <img
                src={message.media_url}
                alt="Sticker"
                width={96}
                height={96}
                loading="lazy"
                decoding="async"
                className="h-24 w-24 object-contain"
              />
            )}

            {isEditing ? (
              <input
                ref={editInputRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleEditKeyDown}
                onBlur={handleEditSubmit}
                className="min-w-[200px] bg-transparent border-b border-current outline-none"
              />
            ) : (
              message.content && (
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              )
            )}

            <div className={`flex items-center gap-1 text-xs ${
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}>
              <span>{formatTime(message.created_at)}</span>
              {message.is_edited && !isEditing && (
                <span className="flex items-center gap-0.5">
                  <Pencil className="h-2.5 w-2.5" />
                  edited
                </span>
              )}
              {isOwn && (
                <span>
                  {message.read_by && message.read_by.length > 0 ? (
                    <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </span>
              )}
            </div>
          </div>

          {message.reactions.length > 0 && (
            <div
              className={`mt-1 flex flex-wrap gap-1 ${
                isOwn ? "justify-end" : "justify-start"
              }`}
            >
              {message.reactions.map((reaction: MessageReaction) => {
                const isMyReaction = reaction.user_id === user?.id;
                return (
                  <button
                    key={`${reaction.user_id}-${reaction.emoji}`}
                    onClick={() => {
                      if (isMyReaction) {
                        sendWsMessage({
                          type: "remove_reaction",
                          message_id: message.id,
                        });
                      } else {
                        onReact(message.id, reaction.emoji);
                      }
                    }}
                    className={`flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-xs transition-colors ${
                      isMyReaction
                        ? "border-primary/50 bg-primary/10"
                        : "border-transparent bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <span>{reaction.emoji}</span>
                    {message.reactions_count > 1 && (
                      <span className="text-muted-foreground">{message.reactions_count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {lightboxOpen && message.media_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="absolute right-4 top-16 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <Download className="h-6 w-6" />
            </button>
            <img
              src={getCloudinaryTransformedUrl(message.media_url, "modal")}
              alt="Full size"
              width={1200}
              height={900}
              decoding="async"
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
