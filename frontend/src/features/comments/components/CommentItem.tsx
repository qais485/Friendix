import { useState } from "react";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";
import {
  MoreHorizontal,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Flag,
  MessageCircle,
  UserPlus,
  UserCheck,
  Ban,
} from "lucide-react";
import { useDeleteComment, usePinComment, useUnpinComment, useHideComment, useUnhideComment, useReportComment, useCommentReplies } from "../hooks";
import { useRelationshipSummary, useSendFriendRequest, useFollow, useBlockUser } from "@/features/friends/hooks";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/store/authStore";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { CommentForm } from "./CommentForm";
import { CommentReactions } from "./CommentReactions";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types";

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  postOwnerId: string;
  postId: string;
  onReply?: (commentId: string) => void;
  isReply?: boolean;
}

export function CommentItem({ comment, currentUserId, postOwnerId, postId, onReply, isReply = false }: CommentItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const { toast } = useToast();

  const deleteComment = useDeleteComment();
  const pinComment = usePinComment();
  const unpinComment = useUnpinComment();
  const hideComment = useHideComment();
  const unhideComment = useUnhideComment();
  const reportComment = useReportComment();

  const commentAuthorId = comment.user_id;
  const { data: relationship } = useRelationshipSummary(
    currentUserId,
    currentUserId && commentAuthorId && commentAuthorId !== currentUserId ? commentAuthorId : undefined
  );
  const sendFriendRequest = useSendFriendRequest(currentUserId);
  const followUser = useFollow(currentUserId);
  const blockUser = useBlockUser(currentUserId);

  const isOwner = comment.user_id === currentUserId;
  const isPostOwner = postOwnerId === currentUserId;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const handleDelete = async () => {
    try { await deleteComment.mutateAsync(comment.id); toast({ title: "Comment deleted" }); }
    catch { toast({ title: "Error", description: "Failed to delete comment", variant: "destructive" }); }
    setShowMenu(false);
  };

  const handlePin = async () => {
    try { await pinComment.mutateAsync({ commentId: comment.id, postId }); toast({ title: "Comment pinned" }); }
    catch { toast({ title: "Error", description: "Failed to pin comment", variant: "destructive" }); }
    setShowMenu(false);
  };

  const handleUnpin = async () => {
    try { await unpinComment.mutateAsync({ commentId: comment.id, postId }); toast({ title: "Comment unpinned" }); }
    catch { toast({ title: "Error", description: "Failed to unpin comment", variant: "destructive" }); }
    setShowMenu(false);
  };

  const handleHide = async () => {
    try { await hideComment.mutateAsync(comment.id); toast({ title: "Comment hidden" }); }
    catch { toast({ title: "Error", description: "Failed to hide comment", variant: "destructive" }); }
    setShowMenu(false);
  };

  const handleUnhide = async () => {
    try { await unhideComment.mutateAsync(comment.id); toast({ title: "Comment unhidden" }); }
    catch { toast({ title: "Error", description: "Failed to unhide comment", variant: "destructive" }); }
    setShowMenu(false);
  };

  const handleReport = async () => {
    try { await reportComment.mutateAsync({ commentId: comment.id, data: { reason: "other", description: "Reported by user" } }); toast({ title: "Comment reported" }); }
    catch { toast({ title: "Error", description: "Failed to report comment", variant: "destructive" }); }
    setShowMenu(false);
  };

  if (comment.is_deleted) {
    return <div className="px-3 py-2 text-xs text-muted-foreground italic">This comment has been deleted.</div>;
  }

  return (
    <div className={cn("py-2.5", isReply && "ml-5 sm:ml-8")}>
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0">
          {comment.author?.avatar_url ? (
            <img
              src={getCloudinaryTransformedUrl(comment.author.avatar_url, "avatar")}
              alt={comment.author.full_name || "User"}
              width={32}
              height={32}
              loading="lazy"
              decoding="async"
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {comment.author?.username?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="rounded-xl bg-muted/50 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-semibold">
                  {comment.author?.full_name || comment.author?.username || "Unknown"}
                </span>
                {comment.author?.is_verified && (
                  <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[8px] text-white">✓</span>
                )}
                <span className="shrink-0 text-[11px] text-muted-foreground">{formatDate(comment.created_at)}</span>
                {comment.is_pinned && (
                  <span className="flex shrink-0 items-center gap-1 text-[11px] text-yellow-500 font-medium">
                    <Pin className="h-3 w-3" /> Pinned
                  </span>
                )}
                {comment.is_hidden && <span className="shrink-0 text-[11px] text-muted-foreground">Hidden</span>}
              </div>

              <div className="relative shrink-0">
                <button onClick={() => setShowMenu(!showMenu)} className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full z-10 mt-1 w-44 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl glass-card p-1.5">
                    {isOwner && (
                      <>
                        <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                          <Edit className="h-4 w-4" /> Edit
                        </button>
                        <button onClick={handleDelete} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </>
                    )}
                    {isPostOwner && (
                      <>
                        {comment.is_pinned ? (
                          <button onClick={handleUnpin} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                            <PinOff className="h-4 w-4" /> Unpin
                          </button>
                        ) : (
                          <button onClick={handlePin} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                            <Pin className="h-4 w-4" /> Pin
                          </button>
                        )}
                        {comment.is_hidden ? (
                          <button onClick={handleUnhide} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                            <Eye className="h-4 w-4" /> Unhide
                          </button>
                        ) : (
                          <button onClick={handleHide} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                            <EyeOff className="h-4 w-4" /> Hide
                          </button>
                        )}
                      </>
                    )}
                    {!isOwner && (
                      <>
                        {relationship && !relationship.are_friends && !relationship.are_blocked && (
                          <button
                            onClick={() => { sendFriendRequest.mutate(commentAuthorId, { onSuccess: () => toast({ title: "Friend request sent" }) }); setShowMenu(false); }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                            disabled={sendFriendRequest.isPending}
                          >
                            <UserPlus className="h-4 w-4" /> Add Friend
                          </button>
                        )}
                        {relationship && !relationship.is_following && !relationship.are_friends && !relationship.are_blocked && (
                          <button
                            onClick={() => { followUser.mutate(commentAuthorId, { onSuccess: () => toast({ title: "Following" }) }); setShowMenu(false); }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                            disabled={followUser.isPending}
                          >
                            <UserCheck className="h-4 w-4" /> Follow
                          </button>
                        )}
                        <button
                          onClick={() => { setShowBlockConfirm(true); setShowMenu(false); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                        >
                          <Ban className="h-4 w-4" /> Block
                        </button>
                        <button onClick={handleReport} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                          <Flag className="h-4 w-4" /> Report
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <CommentForm postId={postId} placeholder="Edit comment..." onCancel={() => setIsEditing(false)} autoFocus />
            ) : (
              <p className="mt-1 whitespace-pre-wrap break-words text-sm">{comment.content}</p>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1">
            <CommentReactions commentId={comment.id} reactions={comment.reactions} hasReacted={comment.has_reacted} />

            {!isReply && (
              <button onClick={() => onReply?.(comment.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <MessageCircle className="h-3 w-3" /> Reply
              </button>
            )}

            {comment.replies_count > 0 && !showReplies && (
              <button onClick={() => setShowReplies(true)} className="text-xs font-medium text-primary hover:underline">
                View {comment.replies_count} {comment.replies_count === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>

          {showReplies && (
            <div className="mt-2">
              <CommentReplies commentId={comment.id} postId={postId} postOwnerId={postOwnerId} />
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showBlockConfirm}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={() => {
          blockUser.mutate(commentAuthorId, { onSuccess: () => toast({ title: "User blocked" }) });
          setShowBlockConfirm(false);
        }}
        title={`Block ${comment.author?.full_name || comment.author?.username || "this user"}?`}
        description="They won't be able to find your profile, posts, or stories. They won't know they've been blocked."
        confirmLabel="Block"
        destructive
        loading={blockUser.isPending}
      />
    </div>
  );
}

function CommentReplies({ commentId, postId, postOwnerId }: { commentId: string; postId: string; postOwnerId: string }) {
  const { data: repliesData, fetchNextPage, hasNextPage, isFetchingNextPage } = useCommentReplies(commentId);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const replies = repliesData?.pages.flatMap((page) => page.comments) ?? [];

  return (
    <div className="space-y-1">
      {isFetchingNextPage && <div className="text-center text-xs text-muted-foreground py-2">Loading...</div>}
      {hasNextPage && !isFetchingNextPage && (
        <button onClick={() => fetchNextPage()} className="text-xs font-medium text-primary hover:underline">
          Load more replies
        </button>
      )}
      {replies.map((reply) => (
        <CommentItem key={reply.id} comment={reply} currentUserId={currentUserId || ""} postOwnerId={postOwnerId} postId={postId} isReply />
      ))}
    </div>
  );
}
