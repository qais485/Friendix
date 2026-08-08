import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMutating } from "@tanstack/react-query";
import {
  Heart,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  MoreHorizontal,
  X,
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
  Share,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";
import { ParsedContent } from "@/components/ParsedContent";
import { CommentThread } from "@/features/comments";
import { getPostBackgroundStyle } from "./composer";
import { onModalOpened, onModalClosed } from "@/lib/activePost";
import type { Post } from "@/types";

interface PostModalProps {
  post: Post;
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
  unhideMode?: boolean;
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

function ModalVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handlePlay = useCallback(() => setEnded(false), []);
  const handleEnded = useCallback(() => setEnded(true), []);

  const handleReplay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setEnded(false);
    video.play().catch(() => {});
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-black">
      <video
        ref={videoRef}
        className="max-h-full max-w-full object-contain"
        src={src}
        playsInline
        autoPlay
        muted={isMuted}
        preload="metadata"
        onPlay={handlePlay}
        onEnded={handleEnded}
      >
        Your browser does not support the video tag.
      </video>

      <button
        onClick={() => setIsMuted((m) => !m)}
        className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>

      {ended && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
          <button
            onClick={handleReplay}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/30 active:scale-95"
            aria-label="Replay video"
          >
            <RotateCcw className="h-7 w-7" />
          </button>
        </div>
      )}
    </div>
  );
}

export function PostModal({
  post,
  currentUserId,
  isOpen,
  onClose,
  unhideMode = false,
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
}: PostModalProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isOwner = post.user_id === currentUserId;

  const isAnyFeedMutationPending = useIsMutating({ mutationKey: ["feed"] }) > 0;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Pause all feed videos while the modal is open.
  useEffect(() => {
    if (!isOpen) return;
    onModalOpened();
    return () => onModalClosed();
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-menu-trigger]") && !target.closest("[data-menu-content]")) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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

  const bgStyle = getPostBackgroundStyle(post.background_style || "none", null, post.background_image_url);
  const hasBackground = bgStyle.textClass !== "";

  const hasMedia =
    imageUrls.length > 0 ||
    !!post.video_url ||
    !!post.gif_url ||
    !!post.audio_url ||
    !!post.document_name;

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.author?.full_name || "Post", url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [post.id, post.author?.full_name]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-50 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/20 md:right-4 md:top-4"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 flex h-[90vh] w-[95vw] max-w-[1100px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:h-[85vh]"
          >
            {/* ── Left: Media ─────────────────────────── */}
            <div className="hidden w-[55%] flex-shrink-0 bg-black md:flex md:items-center md:justify-center">
              {hasBackground && post.content ? (
                /* Background text post */
                <div
                  className="flex h-full w-full items-center justify-center p-10"
                  style={bgStyle.style}
                >
                  <div
                    className="w-full text-center text-2xl font-bold leading-relaxed text-white drop-shadow-lg prose-invert"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                  />
                </div>
              ) : hasMedia ? (
                <div className="relative h-full w-full">
                  {/* Single image */}
                  {imageUrls.length === 1 && !post.video_url && !post.gif_url && (
                    <img
                      src={getCloudinaryTransformedUrl(imageUrls[0].trim(), "modal")}
                      alt="Post image"
                      width={1200}
                      height={900}
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  )}

                  {/* Multiple images — carousel indicator */}
                  {imageUrls.length > 1 && (
                    <div className="relative h-full w-full">
                      <img
                        src={getCloudinaryTransformedUrl(imageUrls[0].trim(), "modal")}
                        alt="Post image"
                        width={1200}
                        height={900}
                        decoding="async"
                        className="h-full w-full object-contain"
                      />
                      {imageUrls.length > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                          {imageUrls.map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "h-1.5 rounded-full transition-all",
                                i === 0 ? "w-6 bg-white" : "w-1.5 bg-white/40"
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video */}
                  {post.video_url && imageUrls.length === 0 && !post.gif_url && (
                    <ModalVideo src={post.video_url} />
                  )}

                  {/* GIF */}
                  {post.gif_url && imageUrls.length === 0 && !post.video_url && (
                    <img
                      src={post.gif_url}
                      alt="GIF"
                      width={1200}
                      height={900}
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
              ) : (
                /* Text-only post (no media) */
                <div className="flex h-full w-full items-center justify-center bg-muted/30 p-10">
                  <p className="text-center text-lg text-muted-foreground">
                    {post.content ? "Text post" : "Empty post"}
                  </p>
                </div>
              )}
            </div>

            {/* ── Right: Details ──────────────────────── */}
            <div className="flex w-full flex-col md:w-[45%]">
              {/* Mobile: background post preview (takes priority) */}
              {hasBackground && post.content && (
                <div
                  className="relative flex aspect-[4/5] w-full items-center justify-center p-6 md:hidden"
                  style={bgStyle.style}
                >
                  <div
                    className="w-full text-center text-xl font-bold leading-relaxed text-white drop-shadow-lg prose-invert"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                  />
                </div>
              )}

              {/* Mobile: compact media preview */}
              {!hasBackground && hasMedia && (
                <div className="relative aspect-[4/5] w-full bg-black md:hidden">
                  {imageUrls.length === 1 && !post.video_url && !post.gif_url && (
                    <img
                      src={getCloudinaryTransformedUrl(imageUrls[0].trim(), "feed")}
                      alt="Post image"
                      width={940}
                      height={1175}
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  )}
                  {imageUrls.length > 1 && (
                    <img
                      src={getCloudinaryTransformedUrl(imageUrls[0].trim(), "feed")}
                      alt="Post image"
                      width={940}
                      height={1175}
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  )}
                  {post.video_url && imageUrls.length === 0 && !post.gif_url && (
                    <ModalVideo src={post.video_url} />
                  )}
                  {post.gif_url && imageUrls.length === 0 && !post.video_url && (
                    <img
                      src={post.gif_url}
                      alt="GIF"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              )}

              {/* Header */}
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Link to={`/profile/${post.author?.username}`} onClick={onClose}>
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
                      onClick={onClose}
                      className="truncate text-sm font-semibold hover:underline"
                    >
                      {post.author?.full_name || "Unknown"}
                    </Link>
                    {post.author?.is_verified && (
                      <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    @{post.author?.username} · {formatDate(post.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-0.5">
                  {!isOwner && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary"
                        onClick={() => onFollow?.(post.user_id)}
                        aria-label="Follow user"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-blue-500"
                        onClick={() => onAddFriend?.(post.user_id)}
                        aria-label="Add friend"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-yellow-500"
                        onClick={() => onAddCloseFriend?.(post.user_id)}
                        aria-label="Add to close friends"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-7 w-7 rounded-full"
                      onClick={() => setShowMenu(!showMenu)}
                      data-menu-trigger
                      aria-label="More options"
                      aria-expanded={showMenu}
                      aria-haspopup="menu"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    {showMenu && (
                      <div
                        role="menu"
                        aria-label="Post actions"
                        data-menu-content
                        className="absolute right-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-2xl glass-card p-1.5 shadow-float"
                      >
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
                    )}
                  </div>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto">
                {/* Caption + content details */}
                <div className="space-y-3 border-b border-border px-4 py-3">
                  {/* Repost header */}
                  {post.shared_post && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Repeat2 className="h-3.5 w-3.5" />
                      <span className="font-medium">{post.shared_post.author?.full_name || "Unknown"}</span>
                    </div>
                  )}

                  {/* Repost content */}
                  {post.shared_post && (
                    <div className="rounded-xl border border-border p-3 text-sm">
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
                    <div className="rounded-xl border-l-4 border-primary bg-primary/5 p-3">
                      <p className="text-sm italic text-muted-foreground">"{post.quote_text}"</p>
                    </div>
                  )}

                  {/* Full caption */}
                  {post.content && (
                    <div className="text-sm leading-relaxed">
                      {post.content.includes("<") ? (
                        <div
                          className="prose prose-sm max-w-none [&_p]:m-0 [&_p]:mb-1.5 [&_p:last-child]:mb-0"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap">
                          <ParsedContent content={post.content} />
                        </p>
                      )}
                    </div>
                  )}

                  {/* Feeling */}
                  {post.feeling_type && post.feeling_text && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Smile className="h-4 w-4" />
                      <span>is feeling <span className="font-medium">{post.feeling_text}</span></span>
                    </div>
                  )}

                  {/* Location */}
                  {post.location_name && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{post.location_name}</span>
                    </div>
                  )}

                  {/* Document */}
                  {post.document_name && (
                    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
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
                    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                      <Volume2 className="h-5 w-5 shrink-0 text-primary" />
                      <audio controls className="flex-1" src={post.audio_url}>
                        Your browser does not support the audio tag.
                      </audio>
                    </div>
                  )}

                  {/* Poll */}
                  {post.poll && (
                    <div className="space-y-2">
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
                              "relative w-full overflow-hidden rounded-xl border p-3 text-left text-sm transition-all",
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

                  {/* Pinned / Scheduled / Draft indicators */}
                  {(post.is_pinned || post.is_scheduled || post.is_draft) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {post.is_pinned && (
                        <span className="inline-flex items-center gap-1 font-medium text-primary">
                          <Pin className="h-3 w-3" /> Pinned
                        </span>
                      )}
                      {post.is_scheduled && (
                        <span className="text-primary">Scheduled</span>
                      )}
                      {post.is_draft && (
                        <span>Draft</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Comments */}
                <div className="px-4 py-3">
                  <CommentThread postId={post.id} postOwnerId={post.user_id} />
                </div>
              </div>

              {/* Actions bar */}
              <div className="border-t border-border">
                <div className="flex items-center gap-0.5 px-4 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-9 gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 text-sm",
                      post.is_liked
                        ? "text-red-500 hover:text-red-600"
                        : "text-muted-foreground hover:text-red-500"
                    )}
                    onClick={() => post.is_liked ? onUnlike?.(post.id) : onLike?.(post.id)}
                    disabled={isAnyFeedMutationPending}
                    aria-label={post.is_liked ? "Unlike" : "Like"}
                  >
                    <Heart className={cn("h-5 w-5 transition-all", post.is_liked && "fill-current")} />
                    {post.likes_count > 0 && <span className="hidden font-medium sm:inline">{post.likes_count}</span>}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 text-sm text-muted-foreground hover:text-primary"
                    aria-label="Comments"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {post.comments_count > 0 && <span className="hidden font-medium sm:inline">{post.comments_count}</span>}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 text-sm text-muted-foreground hover:text-green-500"
                    onClick={() => onRepost?.(post.id)}
                    disabled={isAnyFeedMutationPending}
                    aria-label="Repost"
                  >
                    <Repeat2 className="h-5 w-5" />
                    {post.repost_count > 0 && <span className="hidden font-medium sm:inline">{post.repost_count}</span>}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => onQuote?.(post.id)}
                    aria-label="Quote post"
                  >
                    <Quote className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 text-sm text-muted-foreground hover:text-foreground"
                    onClick={handleShare}
                    aria-label="Share post"
                  >
                    <Share className="h-5 w-5" />
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-full p-1.5 sm:p-2"
                    onClick={() => post.is_saved ? onUnsave?.(post.id) : onSave?.(post.id)}
                    disabled={isAnyFeedMutationPending}
                    aria-label={post.is_saved ? "Unsave post" : "Save post"}
                  >
                    {post.is_saved ? (
                      <BookmarkCheck className="h-5 w-5 fill-primary text-primary" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
