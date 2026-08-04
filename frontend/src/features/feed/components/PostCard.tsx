import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useIsMutating } from "@tanstack/react-query";
import {
  Heart,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  MoreHorizontal,
  Pin,
  PinOff,
  EyeOff,
  Eye,
  Trash2,
  Edit,
  Ban,
  VolumeX,
  Flag,
  MapPin,
  Smile,
  Repeat2,
  Quote,
  FileText,
  Volume2,
  Archive,
  ArchiveRestore,
  CheckCircle2,
  BadgeCheck,
  UserPlus,
  UserCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";
import { ParsedContent } from "@/components/ParsedContent";
import { CommentThread } from "@/features/comments";
import { LiquidGlassFilter } from "@/components/LiquidGlassFilter";
import { getPostBackgroundStyle } from "./composer";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  unhideMode?: boolean;
  onOpenPost?: (post: Post) => void;
  onSave?: (postId: string) => void;
  onUnsave?: (postId: string) => void;
  onHide?: (postId: string) => void;
  onUnhide?: (postId: string) => void;
  onPin?: (postId: string) => void;
  onUnpin?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onEdit?: (post: Post) => void;
  onArchive?: (postId: string) => void;
  onUnarchive?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onQuote?: (postId: string) => void;
  onVotePoll?: (pollId: string, optionId: string) => void;
  onLike?: (postId: string) => void;
  onUnlike?: (postId: string) => void;
  onBlock?: (userId: string) => void;
  onMute?: (userId: string) => void;
  onReport?: (postId: string) => void;
  onFollow?: (userId: string) => void;
  onAddFriend?: (userId: string) => void;
  onAddCloseFriend?: (userId: string) => void;
}

export function PostCard({
  post,
  currentUserId,
  unhideMode = false,
  onOpenPost,
  onSave,
  onUnsave,
  onHide,
  onUnhide,
  onPin,
  onUnpin,
  onDelete,
  onEdit,
  onArchive,
  onUnarchive,
  onRepost,
  onQuote,
  onVotePoll,
  onLike,
  onUnlike,
  onBlock,
  onMute,
  onReport,
  onFollow,
  onAddFriend,
  onAddCloseFriend,
}: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = post.user_id === currentUserId;

  const isAnyFeedMutationPending = useIsMutating({ mutationKey: ["feed"] }) > 0;

  const handleCardClick = (e: React.MouseEvent) => {
    if (!onOpenPost) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, [role='menuitem'], input, textarea")) return;
    onOpenPost(post);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showMenu) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMenu]);

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

  const imageUrls = post.image_urls || [];

  const MenuItem = ({ onClick, icon: Icon, label, danger }: { onClick: () => void; icon: typeof Edit; label: string; danger?: boolean }) => (
    <button
      role="menuitem"
      onClick={() => { onClick(); setShowMenu(false); }}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        danger
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-muted"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  const bgStyle = getPostBackgroundStyle(post.background_style || "none", null, post.background_image_url);
  const hasBackground = bgStyle.textClass !== "";

  const hasMedia =
    imageUrls.length > 0 ||
    !!post.video_url ||
    !!post.gif_url ||
    !!post.audio_url ||
    !!post.document_name;

  const menuContent = (
    <div role="menu" aria-label="Post actions" className="absolute right-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-2xl glass-card p-1.5 shadow-float">
      {isOwner && (
        <>
          <MenuItem onClick={() => onEdit?.(post)} icon={Edit} label="Edit" />
          {post.is_pinned ? (
            <MenuItem onClick={() => onUnpin?.(post.id)} icon={PinOff} label="Unpin" />
          ) : (
            <MenuItem onClick={() => onPin?.(post.id)} icon={Pin} label="Pin" />
          )}
          {post.is_archived ? (
            <MenuItem onClick={() => onUnarchive?.(post.id)} icon={ArchiveRestore} label="Unarchive" />
          ) : (
            <MenuItem onClick={() => onArchive?.(post.id)} icon={Archive} label="Archive" />
          )}
          <MenuItem onClick={() => onDelete?.(post.id)} icon={Trash2} label="Delete" danger />
        </>
      )}
      {!isOwner && (
        <>
          {unhideMode ? (
            <MenuItem onClick={() => onUnhide?.(post.id)} icon={Eye} label="Unhide" />
          ) : post.is_hidden ? (
            <MenuItem onClick={() => onUnhide?.(post.id)} icon={Eye} label="Unhide" />
          ) : (
            <MenuItem onClick={() => onHide?.(post.id)} icon={EyeOff} label="Hide" />
          )}
          <MenuItem onClick={() => onFollow?.(post.user_id)} icon={UserCheck} label="Follow" />
          <MenuItem onClick={() => onAddFriend?.(post.user_id)} icon={UserPlus} label="Add Friend" />
          <MenuItem onClick={() => onAddCloseFriend?.(post.user_id)} icon={Star} label="Add to Close Friends" />
          <div className="my-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <MenuItem onClick={() => onBlock?.(post.user_id)} icon={Ban} label="Block" danger />
          <MenuItem onClick={() => onMute?.(post.user_id)} icon={VolumeX} label="Mute" />
          <MenuItem onClick={() => onReport?.(post.id)} icon={Flag} label="Report" />
        </>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative mx-auto w-full max-w-[470px] overflow-hidden rounded-lg border border-border bg-card",
        onOpenPost && "cursor-pointer hover:shadow-md transition-shadow duration-200"
      )}
      onClick={handleCardClick}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div className={cn(
        "absolute top-0 left-0 right-0 z-10 flex items-center gap-3 px-3 py-2.5",
        (hasMedia || hasBackground) ? "liquid-glass rounded-t-lg" : ""
      )}>
        {(hasMedia || hasBackground) && <LiquidGlassFilter />}
        <Link to={`/profile/${post.author?.username}`}>
          <Avatar
            src={post.author?.avatar_url}
            alt={post.author?.full_name || "User"}
            fallback={(post.author?.full_name || "U")[0].toUpperCase()}
            size="sm"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              to={`/profile/${post.author?.username}`}
              className={cn(
                "truncate text-[13px] font-semibold hover:underline",
                (hasMedia || hasBackground) ? "text-white" : ""
              )}
            >
              {post.author?.full_name || "Unknown"}
            </Link>
            {post.author?.is_verified && (
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {!isOwner && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn("h-7 w-7 rounded-full hover:text-primary", (hasMedia || hasBackground) ? "text-white/80" : "text-muted-foreground")}
                onClick={() => onFollow?.(post.user_id)}
                aria-label="Follow user"
              >
                <UserCheck className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn("h-7 w-7 rounded-full hover:text-blue-500", (hasMedia || hasBackground) ? "text-white/80" : "text-muted-foreground")}
                onClick={() => onAddFriend?.(post.user_id)}
                aria-label="Add friend"
              >
                <UserPlus className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn("h-7 w-7 rounded-full hover:text-yellow-500", (hasMedia || hasBackground) ? "text-white/80" : "text-muted-foreground")}
                onClick={() => onAddCloseFriend?.(post.user_id)}
                aria-label="Add to close friends"
              >
                <Star className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("h-7 w-7 rounded-full", (hasMedia || hasBackground) ? "text-white/80" : "")}
              onClick={() => setShowMenu(!showMenu)}
              aria-label="More options"
              aria-expanded={showMenu}
              aria-haspopup="menu"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {showMenu && menuContent}
          </div>
        </div>
      </div>

      {/* ── Background post (takes priority over media) ── */}
      {hasBackground && post.content && (
        <div className="relative flex aspect-[4/5] w-full items-center justify-center p-6" style={bgStyle.style}>
          <div
            className="w-full text-center text-xl font-bold leading-relaxed text-white drop-shadow-lg prose-invert"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />
          {(post.feeling_type || post.location_name) && (
            <div className="absolute bottom-4 left-4 space-y-1">
              {post.feeling_type && post.feeling_text && (
                <div className="flex items-center gap-1.5 text-sm text-white/80">
                  <Smile className="h-4 w-4" />
                  <span>is feeling <span className="font-medium">{post.feeling_text}</span></span>
                </div>
              )}
              {post.location_name && (
                <div className="flex items-center gap-1.5 text-sm text-white/80">
                  <MapPin className="h-4 w-4" />
                  <span>{post.location_name}</span>
                </div>
              )}
            </div>
          )}
          {post.is_pinned && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1 text-xs font-medium text-white/80">
              <Pin className="h-3 w-3" />
              Pinned
            </div>
          )}

          {/* ── Footer (overlay on background) ─────── */}
          <div className="absolute bottom-0 left-0 right-0 z-10 liquid-glass rounded-b-lg">
            <LiquidGlassFilter />
            <div className="flex items-center gap-0.5 px-3 pt-2 pb-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 gap-1 rounded-full px-2 text-sm",
                  post.is_liked
                    ? "text-red-500 hover:text-red-600"
                    : "text-white/90 hover:text-red-500"
                )}
                onClick={() => post.is_liked ? onUnlike?.(post.id) : onLike?.(post.id)}
                disabled={isAnyFeedMutationPending}
                aria-label={post.is_liked ? "Unlike" : "Like"}
              >
                <Heart className={cn("h-[18px] w-[18px] transition-all", post.is_liked && "fill-current")} />
                {post.likes_count > 0 && <span className="font-medium">{post.likes_count}</span>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 rounded-full px-2 text-sm text-white/90 hover:text-primary"
                onClick={() => setShowComments(!showComments)}
                aria-label="Comments"
                aria-expanded={showComments}
              >
                <MessageCircle className="h-[18px] w-[18px]" />
                {post.comments_count > 0 && <span className="font-medium">{post.comments_count}</span>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 rounded-full px-2 text-sm text-white/90 hover:text-green-500"
                onClick={() => onRepost?.(post.id)}
                disabled={isAnyFeedMutationPending}
                aria-label="Repost"
              >
                <Repeat2 className="h-[18px] w-[18px]" />
                {post.repost_count > 0 && <span className="font-medium">{post.repost_count}</span>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 rounded-full px-2 text-sm text-white/90 hover:text-foreground"
                onClick={() => onQuote?.(post.id)}
                aria-label="Quote post"
              >
                <Quote className="h-[18px] w-[18px]" />
              </Button>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full p-2 text-white/90"
                onClick={() => post.is_saved ? onUnsave?.(post.id) : onSave?.(post.id)}
                disabled={isAnyFeedMutationPending}
                aria-label={post.is_saved ? "Unsave post" : "Save post"}
              >
                {post.is_saved ? (
                  <BookmarkCheck className="h-[18px] w-[18px] fill-primary text-primary" />
                ) : (
                  <Bookmark className="h-[18px] w-[18px]" />
                )}
              </Button>
            </div>
            <div className="px-3 pb-1">
              <span className="text-[11px] text-white/70">
                {formatDate(post.created_at)}
                {post.is_pinned && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 font-medium text-primary">
                    <Pin className="h-2.5 w-2.5" /> Pinned
                  </span>
                )}
                {post.is_scheduled && (
                  <span className="ml-1.5 text-primary">Scheduled</span>
                )}
                {post.is_draft && (
                  <span className="ml-1.5">Draft</span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Media Frame (fixed 4:5) ──────────────────── */}
      {!hasBackground && hasMedia && (
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-black sm:aspect-[4/5]">
          {/* Single image */}
          {imageUrls.length === 1 && !post.video_url && !post.gif_url && (
            <img
              src={getCloudinaryTransformedUrl(imageUrls[0].trim(), "feed")}
              alt="Post image"
              width={940}
              height={1175}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          )}

          {/* Multiple images — grid */}
          {imageUrls.length > 1 && (
            <div className="grid h-full grid-cols-2 gap-px">
              {imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={getCloudinaryTransformedUrl(url.trim(), "feed")}
                  alt={`Post image ${index + 1}`}
                  width={470}
                  height={588}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ))}
            </div>
          )}

          {/* Video */}
          {post.video_url && imageUrls.length === 0 && !post.gif_url && (
            <div className="absolute inset-0 bg-black">
              <video
                controls
                preload="metadata"
                className="h-full w-full object-cover"
                src={post.video_url}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* GIF */}
          {post.gif_url && imageUrls.length === 0 && !post.video_url && (
            <img
              src={post.gif_url}
              alt="GIF"
              width={940}
              height={1175}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          )}

          {/* ── Footer (overlay on image) ───────────── */}
          <div className="absolute bottom-0 left-0 right-0 z-10 liquid-glass rounded-b-lg">
            <LiquidGlassFilter />
            <div className="flex items-center gap-0.5 px-3 pt-2 pb-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 gap-1 rounded-full px-2 text-sm",
                  post.is_liked
                    ? "text-red-500 hover:text-red-600"
                    : "text-white/90 hover:text-red-500"
                )}
                onClick={() => post.is_liked ? onUnlike?.(post.id) : onLike?.(post.id)}
                disabled={isAnyFeedMutationPending}
                aria-label={post.is_liked ? "Unlike" : "Like"}
              >
                <Heart className={cn("h-[18px] w-[18px] transition-all", post.is_liked && "fill-current")} />
                {post.likes_count > 0 && <span className="font-medium">{post.likes_count}</span>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 rounded-full px-2 text-sm text-white/90 hover:text-primary"
                onClick={() => setShowComments(!showComments)}
                aria-label="Comments"
                aria-expanded={showComments}
              >
                <MessageCircle className="h-[18px] w-[18px]" />
                {post.comments_count > 0 && <span className="font-medium">{post.comments_count}</span>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 rounded-full px-2 text-sm text-white/90 hover:text-green-500"
                onClick={() => onRepost?.(post.id)}
                disabled={isAnyFeedMutationPending}
                aria-label="Repost"
              >
                <Repeat2 className="h-[18px] w-[18px]" />
                {post.repost_count > 0 && <span className="font-medium">{post.repost_count}</span>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 rounded-full px-2 text-sm text-white/90 hover:text-foreground"
                onClick={() => onQuote?.(post.id)}
                aria-label="Quote post"
              >
                <Quote className="h-[18px] w-[18px]" />
              </Button>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full p-2 text-white/90"
                onClick={() => post.is_saved ? onUnsave?.(post.id) : onSave?.(post.id)}
                disabled={isAnyFeedMutationPending}
                aria-label={post.is_saved ? "Unsave post" : "Save post"}
              >
                {post.is_saved ? (
                  <BookmarkCheck className="h-[18px] w-[18px] fill-primary text-primary" />
                ) : (
                  <Bookmark className="h-[18px] w-[18px]" />
                )}
              </Button>
            </div>
            <div className="px-3 pb-1">
              <span className="text-[11px] text-white/70">
                {formatDate(post.created_at)}
                {post.is_pinned && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 font-medium text-primary">
                    <Pin className="h-2.5 w-2.5" /> Pinned
                  </span>
                )}
                {post.is_scheduled && (
                  <span className="ml-1.5 text-primary">Scheduled</span>
                )}
                {post.is_draft && (
                  <span className="ml-1.5">Draft</span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Content section (text posts, reposts, etc.) ─ */}
      {!hasBackground && (
        <div className="space-y-2 px-3 pt-2">
          {/* Repost header */}
          {post.shared_post && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Repeat2 className="h-3.5 w-3.5" />
              <span className="font-medium">{post.shared_post.author?.full_name || "Unknown"}</span>
            </div>
          )}

          {/* Repost content */}
          {post.shared_post && (
            <div className="rounded-xl border border-border p-2.5 text-sm">
              {post.shared_post.content?.includes("<") ? (
                <div
                  className="prose prose-sm max-w-none [&_p]:m-0"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.shared_post.content) }}
                />
              ) : (
                <ParsedContent content={post.shared_post.content || ""} />
              )}
              {post.shared_post.image_urls && post.shared_post.image_urls.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-lg">
                  <img
                    src={post.shared_post.image_urls[0].trim()}
                    alt="Shared post image"
                    width={470}
                    height={264}
                    loading="lazy"
                    decoding="async"
                    className="w-full object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* Quote text */}
          {post.quote_text && (
            <div className="rounded-xl border-l-4 border-primary bg-primary/5 p-2.5">
              <p className="text-sm italic text-muted-foreground">"{post.quote_text}"</p>
            </div>
          )}

          {/* Feeling */}
          {post.feeling_type && post.feeling_text && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Smile className="h-3.5 w-3.5" />
              <span>is feeling <span className="font-medium">{post.feeling_text}</span></span>
            </div>
          )}

          {/* Location */}
          {post.location_name && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{post.location_name}</span>
            </div>
          )}

          {/* Document */}
          {post.document_name && (
            <div className="flex items-center gap-3 rounded-xl border border-border p-2.5">
              <FileText className="h-6 w-6 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{post.document_name}</p>
                {post.document_url ? (
                  <a
                    href={post.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Open document
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">No URL</span>
                )}
              </div>
            </div>
          )}

          {/* Audio */}
          {post.audio_url && (
            <div className="flex items-center gap-3 rounded-xl border border-border p-2.5">
              <Volume2 className="h-5 w-5 shrink-0 text-primary" />
              <audio controls className="flex-1" src={post.audio_url}>
                Your browser does not support the audio tag.
              </audio>
            </div>
          )}

          {/* Poll */}
          {post.poll && (
            <div className="space-y-1.5">
              <p className="text-sm font-semibold">{post.poll.question}</p>
              {post.poll.options.map((option) => {
                const percentage = post.poll!.total_votes > 0
                  ? Math.round((option.votes_count / post.poll!.total_votes) * 100)
                  : 0;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      if (!option.has_voted && !post.poll!.is_expired && onVotePoll) {
                        onVotePoll(post.poll!.id, option.id);
                      }
                    }}
                    disabled={option.has_voted || post.poll!.is_expired}
                    className={cn(
                      "relative w-full overflow-hidden rounded-xl border p-2.5 text-left text-sm transition-all",
                      option.has_voted
                        ? "border-primary/30 bg-primary/5"
                        : "hover:border-primary/30 hover:bg-muted/50",
                      post.poll!.is_expired && "cursor-default opacity-60"
                    )}
                  >
                    {option.has_voted && (
                      <div
                        className="absolute inset-0 bg-primary/10 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    )}
                    <div className="relative flex items-center justify-between">
                      <span className="font-medium">{option.text}</span>
                      {option.has_voted && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          <span className="font-semibold">{percentage}%</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
              <p className="text-xs text-muted-foreground">
                {post.poll.total_votes} vote{post.poll.total_votes !== 1 ? "s" : ""}
                {post.poll.is_expired && " · Ended"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Footer (text-only posts) ──────────────────── */}
      {!hasBackground && !hasMedia && (
        <div>
          <div className="flex items-center gap-0.5 px-3 pt-2 pb-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1 rounded-full px-2 text-sm",
                post.is_liked
                  ? "text-red-500 hover:text-red-600"
                  : "text-muted-foreground hover:text-red-500"
              )}
              onClick={() => post.is_liked ? onUnlike?.(post.id) : onLike?.(post.id)}
              disabled={isAnyFeedMutationPending}
              aria-label={post.is_liked ? "Unlike" : "Like"}
            >
              <Heart className={cn("h-[18px] w-[18px] transition-all", post.is_liked && "fill-current")} />
              {post.likes_count > 0 && <span className="font-medium">{post.likes_count}</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 rounded-full px-2 text-sm text-muted-foreground hover:text-primary"
              onClick={() => setShowComments(!showComments)}
              aria-label="Comments"
              aria-expanded={showComments}
            >
              <MessageCircle className="h-[18px] w-[18px]" />
              {post.comments_count > 0 && <span className="font-medium">{post.comments_count}</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 rounded-full px-2 text-sm text-muted-foreground hover:text-green-500"
              onClick={() => onRepost?.(post.id)}
              disabled={isAnyFeedMutationPending}
              aria-label="Repost"
            >
              <Repeat2 className="h-[18px] w-[18px]" />
              {post.repost_count > 0 && <span className="font-medium">{post.repost_count}</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 rounded-full px-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => onQuote?.(post.id)}
              aria-label="Quote post"
            >
              <Quote className="h-[18px] w-[18px]" />
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full p-2"
              onClick={() => post.is_saved ? onUnsave?.(post.id) : onSave?.(post.id)}
              disabled={isAnyFeedMutationPending}
              aria-label={post.is_saved ? "Unsave post" : "Save post"}
            >
              {post.is_saved ? (
                <BookmarkCheck className="h-[18px] w-[18px] fill-primary text-primary" />
              ) : (
                <Bookmark className="h-[18px] w-[18px]" />
              )}
            </Button>
          </div>
          <div className="px-3 pb-1">
            <span className="text-[11px] text-muted-foreground">
              {formatDate(post.created_at)}
              {post.is_pinned && (
                <span className="ml-1.5 inline-flex items-center gap-0.5 font-medium text-primary">
                  <Pin className="h-2.5 w-2.5" /> Pinned
                </span>
              )}
              {post.is_scheduled && (
                <span className="ml-1.5 text-primary">Scheduled</span>
              )}
              {post.is_draft && (
                <span className="ml-1.5">Draft</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* ── Caption ──────────────────────────────────── */}
      {post.content && !hasBackground && (
        <div className="px-3 pb-2">
          <div className="text-[13px] leading-snug">
            {post.content.includes("<") ? (
              captionExpanded ? (
                <div
                  className="prose prose-sm max-w-none [&_p]:m-0 [&_p]:mb-1 [&_p:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                />
              ) : (
                <div
                  className="line-clamp-1 prose prose-sm max-w-none [&_p]:m-0"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                />
              )
            ) : captionExpanded ? (
              <p className="whitespace-pre-wrap">
                <ParsedContent content={post.content} />
              </p>
            ) : (
              <p className="line-clamp-1 whitespace-pre-wrap">
                <ParsedContent content={post.content} />
              </p>
            )}
            {!captionExpanded && post.content.length > 100 && (
              <button
                onClick={() => setCaptionExpanded(true)}
                className="ml-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                more
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Comments ─────────────────────────────────── */}
      {showComments && (
        <div className="border-t border-border px-3 py-3">
          <CommentThread postId={post.id} postOwnerId={post.user_id} />
        </div>
      )}
    </motion.div>
  );
}
