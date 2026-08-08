import { useState } from "react";
import { usePostComments } from "../hooks";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

interface CommentThreadProps {
  postId: string;
  postOwnerId: string;
}

export function CommentThread({ postId, postOwnerId }: CommentThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const { data: commentsData, fetchNextPage, hasNextPage, isFetchingNextPage } = usePostComments(postId);

  const comments = commentsData?.pages.flatMap((page) => page.comments) ?? [];
  const totalComments = commentsData?.pages[0]?.total ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Comments {totalComments > 0 && `(${totalComments})`}
        </h3>
      </div>

      {user && (
        <CommentForm postId={postId} placeholder="Write a comment..." />
      )}

      <div className="space-y-1">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={user?.id || ""}
            postOwnerId={postOwnerId}
            postId={postId}
            onReply={(commentId) => setReplyingTo(commentId)}
          />
        ))}
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center py-3">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {hasNextPage && !isFetchingNextPage && (
        <button
          onClick={() => fetchNextPage()}
          className="w-full text-center text-sm font-medium text-primary hover:underline py-2"
        >
          Load more comments
        </button>
      )}

      {comments.length === 0 && (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      )}

      {replyingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-4">
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-4 shadow-2xl">
            <h3 className="mb-3 text-sm font-semibold">Reply to comment</h3>
            <CommentForm
              postId={postId}
              parentId={replyingTo}
              placeholder="Write a reply..."
              onCancel={() => setReplyingTo(null)}
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
}
