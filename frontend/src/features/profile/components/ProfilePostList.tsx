import { Loader2, Play, FileText, Volume2, Pin, Repeat2 } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { getVideoPosterUrl } from "@/lib/cloudinaryTransform";
import { getPostBackgroundStyle } from "@/features/feed/components/composer";
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

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getPostThumbnail(post: Post): string | null {
  if (post.image_urls?.length) return post.image_urls[0].trim();
  if (post.video_url) return getVideoPosterUrl(post.video_url) ?? null;
  if (post.gif_url) return post.gif_url;
  if (post.shared_post) {
    if (post.shared_post.image_urls?.length) return post.shared_post.image_urls[0].trim();
    if (post.shared_post.video_url) return getVideoPosterUrl(post.shared_post.video_url) ?? null;
  }
  return null;
}

function getPostPreview(post: Post): string {
  if (post.content?.trim()) return stripHtml(post.content).slice(0, 80);
  if (post.poll?.question) return post.poll.question;
  if (post.quote_text) return `"${post.quote_text}"`;
  if (post.document_name) return post.document_name;
  if (post.location_name) return post.location_name;
  if (post.shared_post) {
    const sharedText = stripHtml(post.shared_post.content);
    if (sharedText) return sharedText.slice(0, 80);
  }
  return "";
}

function ProfilePostTile({ post, onOpen }: { post: Post; onOpen: () => void }) {
  const thumbnail = getPostThumbnail(post);
  const bgStyle = getPostBackgroundStyle(post.background_style || "none", null, post.background_image_url);
  const hasBackground = bgStyle.textClass !== "";
  const imageCount = post.image_urls?.length ?? 0;
  const preview = getPostPreview(post);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open post"
      className="group relative aspect-square w-full min-w-0 overflow-hidden rounded-xl border border-border/60 bg-card shadow-card transition-transform duration-200 hover:scale-[1.02] hover:shadow-elevated active:scale-95"
    >
      {thumbnail ? (
        <OptimizedImage
          src={thumbnail}
          alt="Post preview"
          preset="thumbnail"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : hasBackground ? (
        <div
          className="flex h-full w-full items-center justify-center p-2"
          style={bgStyle.style}
        >
          {preview ? (
            <span className="line-clamp-3 w-full break-words text-center text-[11px] font-semibold leading-snug text-white drop-shadow">
              {preview}
            </span>
          ) : (
            <FileText className="h-6 w-6 text-white/80" />
          )}
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-primary/10 to-purple-500/10 p-2">
          {post.video_url ? (
            <Play className="h-6 w-6 shrink-0 text-primary" />
          ) : post.audio_url ? (
            <Volume2 className="h-6 w-6 shrink-0 text-primary" />
          ) : post.shared_post ? (
            <Repeat2 className="h-6 w-6 shrink-0 text-primary" />
          ) : (
            <FileText className="h-6 w-6 shrink-0 text-primary" />
          )}
          {preview ? (
            <span className="line-clamp-3 break-words text-center text-[11px] font-medium leading-snug text-muted-foreground">
              {preview}
            </span>
          ) : (
            <span className="text-[11px] font-medium text-muted-foreground">Post</span>
          )}
        </div>
      )}

      {post.video_url && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          </span>
        </span>
      )}

      {imageCount > 1 && (
        <span className="absolute right-1.5 top-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          {imageCount}
        </span>
      )}

      {post.is_pinned && (
        <span className="absolute left-1.5 top-1.5 rounded-full bg-black/55 p-1 text-white backdrop-blur-sm" aria-label="Pinned">
          <Pin className="h-3 w-3" />
        </span>
      )}

      {post.is_draft && (
        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          Draft
        </span>
      )}
    </button>
  );
}

export function ProfilePostList({
  title,
  icon: Icon,
  posts,
  isLoading,
  emptyTitle,
  emptyDescription,
  onOpenPost,
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
      <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {posts.map((post) => (
          <ProfilePostTile
            key={post.id}
            post={post}
            onOpen={() => onOpenPost?.(post)}
          />
        ))}
      </div>
    </div>
  );
}
