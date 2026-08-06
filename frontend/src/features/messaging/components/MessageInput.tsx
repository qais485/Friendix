import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Smile,
  Paperclip,
  Mic,
  Image,
  X,
  FileIcon,
  StopCircle,
} from "lucide-react";
import { useMessagingStore } from "@/store/messagingStore";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useUploadMedia } from "../hooks";

const EMOJI_GRID = [
  "😀", "😂", "😍", "🥰", "😎", "🤔", "😅", "🙏", "👍", "❤️",
  "🔥", "🎉", "😢", "😤", "👀", "💯", "✨", "🤝", "💪", "🫡",
  "😎", "🥳", "😇", "🫶", "🤩", "😊", "🙌", "💕", "👏", "🤣",
];

interface MessageInputProps {
  onSendMessage: (content: string, type?: string, mediaUrl?: string, fileName?: string, fileSize?: number, mimeType?: string, duration?: number) => void;
  replyTo?: { id: string; content: string | null; sender_name: string | null } | null;
  onClearReply?: () => void;
  conversationId?: string;
}

export function MessageInput({ onSendMessage, replyTo, onClearReply, conversationId }: MessageInputProps) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [pendingFile, setPendingFile] = useState<{ file: File; preview?: string; type: "image" | "file" | "gif" } | null>(null);
  const { sendWsMessage } = useMessagingStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const uploadMedia = useUploadMedia();

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (pendingFile?.preview) URL.revokeObjectURL(pendingFile.preview);
      if (isTypingRef.current && conversationId) {
        sendWsMessage({ type: "typing", conversation_id: conversationId, is_typing: false });
      }
    };
  }, [pendingFile?.preview, conversationId, sendWsMessage]);

  const handleSend = useCallback(() => {
    if (pendingFile) {
      uploadMedia.mutate(pendingFile.file, {
        onSuccess: (res) => {
          const mediaType = pendingFile.type === "image" ? "image" : pendingFile.type === "gif" ? "gif" : "file";
          onSendMessage(
            "",
            mediaType,
            res.url,
            pendingFile.file.name,
            pendingFile.file.size,
            pendingFile.file.type,
          );
          setPendingFile(null);
        },
      });
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) return;
    onSendMessage(trimmed, "text");
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, pendingFile, onSendMessage, uploadMedia]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;

    if (conversationId && sendWsMessage) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        sendWsMessage({ type: "typing", conversation_id: conversationId, is_typing: true });
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        sendWsMessage({ type: "typing", conversation_id: conversationId, is_typing: false });
      }, 2000);
    }
  };

  const addEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const fileName = `voice-${Date.now()}.webm`;
        const audioFile = new File([blob], fileName, { type: "audio/webm" });
        uploadMedia.mutate(audioFile, {
          onSuccess: (res) => {
            onSendMessage("", "voice", res.url, audioFile.name, audioFile.size, audioFile.type, recordingTime);
          },
        });
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        setRecordingTime(0);
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      // microphone permission denied or not available
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const cancelRecording = () => {
    mediaRecorderRef.current?.stop();
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    setRecordingTime(0);
    setIsRecording(false);
    audioChunksRef.current = [];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file" | "gif") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (pendingFile?.preview) URL.revokeObjectURL(pendingFile.preview);
    const preview = type === "image" || type === "gif" ? URL.createObjectURL(file) : undefined;
    setPendingFile({ file, preview, type });
    e.target.value = "";
  };

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="border-t bg-background p-3">
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-2 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary">Replying to {replyTo.sender_name}</p>
              <p className="truncate text-xs text-muted-foreground">{replyTo.content}</p>
            </div>
            <button onClick={onClearReply} className="shrink-0 rounded-full p-1 hover:bg-muted">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingFile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-2 relative inline-block"
          >
            {pendingFile.preview ? (
              <OptimizedImage
                src={pendingFile.preview}
                alt="Preview"
                preset="full"
                className="h-24 rounded-lg object-cover"
              />
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <FileIcon className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium truncate max-w-[200px]">{pendingFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(pendingFile.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                if (pendingFile?.preview) URL.revokeObjectURL(pendingFile.preview);
                setPendingFile(null);
              }}
              className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isRecording && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mb-2 flex items-center gap-3 rounded-lg bg-destructive/10 px-3 py-2"
        >
          <div className="h-3 w-3 animate-pulse rounded-full bg-destructive" />
          <span className="text-sm font-medium text-destructive">
            Recording {formatRecordingTime(recordingTime)}
          </span>
          <div className="flex-1" />
          <button
            onClick={cancelRecording}
            className="rounded-full p-1.5 hover:bg-destructive/20"
          >
            <X className="h-4 w-4 text-destructive" />
          </button>
          <button
            onClick={stopRecording}
            className="rounded-full p-1.5 hover:bg-destructive/20"
          >
            <StopCircle className="h-5 w-5 text-destructive" />
          </button>
        </motion.div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "image")}
        />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "file")}
        />

        {!isRecording && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Send image"
            >
              <Image className="h-5 w-5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Add emoji"
              aria-expanded={showEmoji}
            >
              <Smile className="h-5 w-5" />
            </button>
          </div>
        )}

        {!isRecording && (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="min-h-[40px] max-h-[120px] flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        )}

        {!isRecording && (
          text.trim() || pendingFile ? (
            <button
              onClick={handleSend}
              disabled={uploadMedia.isPending}
              className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90"
              aria-label="Record voice message"
            >
              <Mic className="h-5 w-5" />
            </button>
          )
        )}
      </div>

      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 grid grid-cols-6 gap-1 rounded-lg border bg-background p-2 shadow-lg sm:grid-cols-10"
          >
            {EMOJI_GRID.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="rounded p-1 text-lg hover:bg-muted"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
