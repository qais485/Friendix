import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVideoComments, useCreateVideoComment, useDeleteVideoComment, useVideoCommentReplies } from "../hooks";
import { useAuthStore } from "@/store/authStore";
import type { VideoComment } from "@/types/videos";

interface VideoCommentsProps {
  videoId: string;
}

function CommentItem({ comment, videoId, currentUserId, onDelete }: {
  comment: VideoComment;
  videoId: string;
  currentUserId: string;
  onDelete: (id: string) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { data: replies } = useVideoCommentReplies(showReplies ? comment.id : undefined);
  const createReply = useCreateVideoComment();

  const handleReply = () => {
    if (!replyText.trim()) return;
    createReply.mutate(
      { videoId, data: { content: replyText.trim(), parent_id: comment.id } },
      { onSuccess: () => { setReplyText(""); setShowReplies(true); } }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        {comment.user?.avatar_url ? (
          <img
            src={comment.user.avatar_url}
            alt=""
            width={32}
            height={32}
            loading="lazy"
            decoding="async"
            className="h-8 w-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary shrink-0">
            {(comment.user?.full_name || "U")[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{comment.user?.full_name || comment.user?.username || "Unknown"}</span>
            <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="mt-0.5 text-sm">{comment.content}</p>
          <div className="mt-1 flex items-center gap-3">
            {comment.replies_count > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {comment.replies_count} {comment.replies_count === 1 ? "reply" : "replies"}
              </button>
            )}
            {currentUserId === comment.user_id && (
              <button onClick={() => onDelete(comment.id)} className="text-xs text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showReplies && replies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-11 space-y-3 border-l-2 border-muted pl-4"
          >
            {replies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                {reply.user?.avatar_url ? (
                  <img
                    src={reply.user.avatar_url}
                    alt=""
                    width={24}
                    height={24}
                    loading="lazy"
                    decoding="async"
                    className="h-6 w-6 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary shrink-0">
                    {(reply.user?.full_name || "U")[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{reply.user?.full_name || reply.user?.username}</span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(reply.created_at)}</span>
                  </div>
                  <p className="mt-0.5 text-xs">{reply.content}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                placeholder="Write a reply..."
                className="flex-1 rounded-full border bg-transparent px-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground"
              />
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleReply} disabled={!replyText.trim()}>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

export function VideoComments({ videoId }: VideoCommentsProps) {
  const { user } = useAuthStore();
  const currentUserId = user?.id || "";
  const [commentText, setCommentText] = useState("");
  const { data, isLoading } = useVideoComments(videoId);
  const createComment = useCreateVideoComment();
  const deleteComment = useDeleteVideoComment();

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    createComment.mutate(
      { videoId, data: { content: commentText.trim() } },
      { onSuccess: () => setCommentText("") }
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {data?.total_count ?? 0} {data?.total_count === 1 ? "Comment" : "Comments"}
      </h3>

      {/* Comment input */}
      <div className="flex gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary shrink-0">
          {user?.full_name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Add a comment..."
            className="flex-1 rounded-full border bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Button
            size="sm"
            className="rounded-full px-4"
            onClick={handleSubmit}
            disabled={!commentText.trim() || createComment.isPending}
          >
            {createComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !data?.comments || data.comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4">
          {data.comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              videoId={videoId}
              currentUserId={currentUserId}
              onDelete={(id) => deleteComment.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
