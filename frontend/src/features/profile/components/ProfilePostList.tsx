import { Loader2 } from "lucide-react";
import { PostCard } from "@/features/feed/components";
import type { Post } from "@/types";

export interface PostCardHandlers {
  onOpenPost?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onUnsave?: (postId: string) => void;
  onHide?: (postId: string) => void;
  onUnhide?: (postId: string) => void;
  onLike?: (postId: string) => void;
  onUnlike?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onVotePoll?: (pollId: string, optionId: string) => void;
  onPin?: (postId: string) => void;
  onUnpin?: (postId: string) => void;
  onArchive?: (postId: string) => void;
  onUnarchive?: (postId: string) => void;
  onBlock?: (userId: string) => void;
  onMute?: (userId: string) => void;
  onReport?: (postId: string) => void;
  onFollow?: (userId: string) => void;
  onAddFriend?: (userId: string) => void;
  onAddCloseFriend?: (userId: string) => void;
}

interface ProfilePostListProps extends PostCardHandlers {
  title?: string;
  icon: typeof Loader2;
  posts: Post[];
  isLoading: boolean;
  emptyTitle: string;
  emptyDescription: string;
  currentUserId: string;
  unhideMode?: boolean;
}

export function ProfilePostList({
  title,
  icon: Icon,
  posts,
  isLoading,
  emptyTitle,
  emptyDescription,
  currentUserId,
  unhideMode,
  onOpenPost,
  onDelete,
  onSave,
  onUnsave,
  onHide,
  onUnhide,
  onLike,
  onUnlike,
  onRepost,
  onVotePoll,
  onPin,
  onUnpin,
  onArchive,
  onUnarchive,
  onBlock,
  onMute,
  onReport,
  onFollow,
  onAddFriend,
  onAddCloseFriend,
}: ProfilePostListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl glass-card p-6 text-center">
        <Icon className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <p className="mt-4 font-semibold">{emptyTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          unhideMode={unhideMode}
          onOpenPost={onOpenPost}
          onDelete={onDelete}
          onSave={onSave}
          onUnsave={onUnsave}
          onHide={onHide}
          onUnhide={onUnhide}
          onLike={onLike}
          onUnlike={onUnlike}
          onRepost={onRepost}
          onVotePoll={onVotePoll}
          onPin={onPin}
          onUnpin={onUnpin}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onBlock={onBlock}
          onMute={onMute}
          onReport={onReport}
          onFollow={onFollow}
          onAddFriend={onAddFriend}
          onAddCloseFriend={onAddCloseFriend}
        />
      ))}
    </div>
  );
}
