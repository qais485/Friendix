import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Eye,
  Clock,
  Trash2,
  Archive,
  Music,
  Users,
  Star,
  UserPlus,
  UserCheck,
  Ban,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { getVideoPosterUrl } from "@/lib/cloudinaryTransform";

import {
  useViewStory,
  useDeleteStory,
  useArchiveStory,
  useAddStoryToHighlight,
  useUserHighlights,
} from "../hooks";
import {
  useRelationshipSummary,
  useSendFriendRequest,
  useFollow,
  useBlockUser,
} from "@/features/friends/hooks";
import { useToast } from "@/hooks/useToast";
import { tracking } from "@/services/tracking";
import { StoryReactions } from "./StoryReactions";
import { StoryReplyInput } from "./StoryReplyInput";
import type { Story } from "@/types";

const STORY_DURATION_MS = 5000;
const SWIPE_THRESHOLD = 50;

interface StoryViewerProps {
  stories: Story[];
  initialIndex?: number;
  userId: string;
  onClose: () => void;
}

export function StoryViewer({
  stories,
  initialIndex = 0,
  userId,
  onClose,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );

  const viewStory = useViewStory();
  const deleteStory = useDeleteStory();
  const archiveStory = useArchiveStory();
  const addStoryToHighlight = useAddStoryToHighlight();
  const { data: highlights = [] } = useUserHighlights(userId || undefined);
  const { toast } = useToast();

  const currentStory = stories[currentIndex];
  const storyAuthorId = currentStory?.user_id;
  const isOwner = storyAuthorId === userId;

  const { data: relationship } = useRelationshipSummary(
    userId,
    !isOwner && userId && storyAuthorId ? storyAuthorId : undefined
  );
  const sendFriendRequest = useSendFriendRequest(userId);
  const followUser = useFollow(userId);
  const blockUser = useBlockUser(userId);

  // Group stories by user for progress bar display
  const storyGroups = useMemo(() => {
    const groups: { userId: string; start: number; count: number }[] = [];
    let current: { userId: string; start: number; count: number } | null = null;

    stories.forEach((story, index) => {
      if (!current || current.userId !== story.user_id) {
        if (current) groups.push(current);
        current = { userId: story.user_id, start: index, count: 1 };
      } else {
        current.count++;
      }
    });
    if (current) groups.push(current);
    return groups;
  }, [stories]);

  // Find current user's group
  const currentGroup = storyGroups.find(
    (g) =>
      currentIndex >= g.start && currentIndex < g.start + g.count
  );

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Mark story as viewed
  useEffect(() => {
    if (currentStory) {
      viewStory.mutate(currentStory.id);
      tracking.viewStart({
        content_type: "story",
        content_id: currentStory.id,
        creator_id: currentStory.user_id,
        context: "story_viewer",
      });
    }
  }, [currentStory?.id]);

  // Progress timer
  useEffect(() => {
    if (isPaused || !currentStory) return;

    const isVideo =
      currentStory.media?.media_type === "video";
    const duration = isVideo ? 15000 : STORY_DURATION_MS;

    const startTime = Date.now();
    const startProgress = progress;

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = startProgress + (elapsed / duration) * (100 - startProgress);

      if (newProgress >= 100) {
        setProgress(100);
        clearInterval(progressInterval.current!);
        // Auto-advance after a short delay
        setTimeout(() => goNext(), 100);
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentIndex, isPaused, currentStory?.id]);

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goToNextUser = useCallback(() => {
    if (!currentGroup) {
      onClose();
      return;
    }
    const nextGroupStart = currentGroup.start + currentGroup.count;
    if (nextGroupStart < stories.length) {
      setCurrentIndex(nextGroupStart);
    } else {
      onClose();
    }
  }, [currentGroup, stories.length, onClose]);

  const goToPrevUser = useCallback(() => {
    if (!currentGroup || currentGroup.start === 0) {
      return;
    }
    // Find the previous group
    const currentGroupIndex = storyGroups.indexOf(currentGroup);
    if (currentGroupIndex > 0) {
      setCurrentIndex(storyGroups[currentGroupIndex - 1]!.start);
    }
  }, [currentGroup, storyGroups]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onClose]);

  // Touch/pointer handlers for tap and hold
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      touchStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
      isHoldingRef.current = false;

      holdTimerRef.current = setTimeout(() => {
        isHoldingRef.current = true;
        setIsPaused(true);
      }, 200);
    },
    []
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }

      if (isHoldingRef.current) {
        setIsPaused(false);
        isHoldingRef.current = false;
        return;
      }

      if (!touchStartRef.current) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const isLeftSide = x < width / 3;
      const isRightSide = x > (width * 2) / 3;

      // Check for swipe
      const deltaX = e.clientX - touchStartRef.current.x;
      const deltaY = e.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      if (Math.abs(deltaY) > SWIPE_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX) && deltaTime < 300) {
        // Vertical swipe
        if (deltaY > 0) {
          // Swipe down - close
          onClose();
        }
      } else if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < 300) {
        // Horizontal swipe
        if (deltaX < 0) {
          // Swipe left - next user
          goToNextUser();
        } else {
          // Swipe right - previous user
          goToPrevUser();
        }
      } else {
        // Tap
        if (isLeftSide) {
          goPrev();
        } else if (isRightSide) {
          goNext();
        }
      }

      touchStartRef.current = null;
    },
    [goNext, goPrev, goToNextUser, goToPrevUser, onClose]
  );

  const handlePointerLeave = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }
    if (isHoldingRef.current) {
      setIsPaused(false);
      isHoldingRef.current = false;
    }
  }, []);

  const handleDelete = async () => {
    if (confirm("Delete this story?")) {
      await deleteStory.mutateAsync(currentStory.id);
      if (stories.length <= 1) {
        onClose();
      } else {
        goNext();
      }
    }
  };

  const handleArchive = async () => {
    await archiveStory.mutateAsync(currentStory.id);
    if (stories.length <= 1) {
      onClose();
    } else {
      goNext();
    }
  };

  const handleAddToHighlight = async (highlightId: string) => {
    await addStoryToHighlight.mutateAsync({
      highlightId,
      storyId: currentStory.id,
    });
    setShowHighlights(false);
  };

  if (!currentStory) return null;

  const timeLeft = Math.max(
    0,
    Math.floor(
      (new Date(currentStory.expires_at).getTime() - Date.now()) / 1000 / 60 / 60
    )
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        onClick={(e) => {
          // Close when clicking outside the story content
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="relative h-full w-full max-w-md select-none"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          style={{ touchAction: "none" }}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-3 top-3 z-20 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Owner actions */}
          {isOwner && (
            <div className="absolute left-3 top-3 z-20 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={handleDelete}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={handleArchive}
              >
                <Archive className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setShowHighlights(!showHighlights)}
              >
                <Star className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Non-owner relationship actions */}
          {!isOwner && relationship && (
            <div className="absolute right-14 top-3 z-20 flex flex-wrap items-center justify-end gap-2">
              {!relationship.are_friends && !relationship.are_blocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 gap-1.5"
                  onClick={() =>
                    sendFriendRequest.mutate(storyAuthorId, {
                      onSuccess: () =>
                        toast({ title: "Friend request sent" }),
                    })
                  }
                  disabled={sendFriendRequest.isPending}
                >
                  <UserPlus className="h-4 w-4" />
                  Add Friend
                </Button>
              )}
              {!relationship.is_following && !relationship.are_blocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 gap-1.5"
                  onClick={() => {
                    if (currentStory) {
                      tracking.follow({
                        content_type: "story",
                        content_id: currentStory.id,
                        creator_id: currentStory.user_id,
                        context: "story_viewer",
                      });
                    }
                    followUser.mutate(storyAuthorId, {
                      onSuccess: () => toast({ title: "Following" }),
                    });
                  }}
                  disabled={followUser.isPending}
                >
                  <UserCheck className="h-4 w-4" />
                  Follow
                </Button>
              )}
              {!relationship.are_blocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => setShowBlockConfirm(true)}
                >
                  <Ban className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Highlights dropdown */}
          {showHighlights && isOwner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-3 top-14 z-30 w-64 max-w-[calc(100vw-2rem)] rounded-xl bg-background p-3 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="mb-2 text-sm font-semibold">Add to Highlight</p>
              {highlights.length === 0 ? (
                <p className="text-xs text-muted-foreground">No highlights yet</p>
              ) : (
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {highlights.map((highlight) => (
                    <button
                      key={highlight.id}
                      onClick={() => handleAddToHighlight(highlight.id)}
                      className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-muted"
                    >
                      {highlight.cover_url ? (
                        <OptimizedImage
                          src={highlight.cover_url}
                          alt=""
                          preset="avatar"
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Star className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      {highlight.title}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Progress bars */}
          <div className="absolute left-3 right-3 top-3 z-20 flex gap-1">
            {currentGroup &&
              Array.from({ length: currentGroup.count }, (_, i) => {
                const storyIndex = currentGroup.start + i;
                const isCurrent = storyIndex === currentIndex;
                const isPast = storyIndex < currentIndex;

                return (
                  <div
                    key={storyIndex}
                    className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30"
                  >
                    <motion.div
                      className="h-full bg-white"
                      initial={{ width: isPast ? "100%" : "0%" }}
                      animate={{
                        width: isPast
                          ? "100%"
                          : isCurrent
                          ? `${progress}%`
                          : "0%",
                      }}
                      transition={
                        isCurrent
                          ? { duration: 0.05, ease: "linear" }
                          : { duration: 0 }
                      }
                    />
                  </div>
                );
              })}
          </div>

          {/* Pause indicator */}
          {isPaused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                <Pause className="h-8 w-8 text-white" />
              </div>
            </motion.div>
          )}

          {/* Author info and time */}
          <div className="absolute left-3 top-10 z-20 flex items-center gap-2">
            <div className="flex items-center gap-2">
              {currentStory.user?.avatar_url ? (
                <OptimizedImage
                  src={currentStory.user.avatar_url}
                  alt=""
                  preset="avatar"
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-white/20"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/80 text-xs font-semibold text-white ring-2 ring-white/20">
                  {(currentStory.user?.full_name || "U")[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="max-w-[40vw] truncate text-sm font-semibold text-white">
                  {currentStory.user?.full_name || "Unknown"}
                </p>
                <p className="text-[11px] text-white/70">
                  {timeAgo(currentStory.created_at)}
                </p>
              </div>
            </div>
            {currentStory.is_close_friends_only && (
              <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                <Users className="h-3 w-3" />
                Close Friends
              </div>
            )}
          </div>

          {/* Time remaining */}
          <div className="absolute right-3 top-10 z-20">
            <div className="flex items-center gap-1 text-white/70">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">{timeLeft}h left</span>
            </div>
          </div>

          {/* View count */}
          <div className="absolute bottom-4 left-3 z-20 flex items-center gap-1.5 text-white/70">
            <Eye className="h-3.5 w-3.5" />
            <span className="text-xs">{currentStory.views_count} views</span>
          </div>

          {/* Music info */}
          {currentStory.music_name && (
            <div className="absolute bottom-14 left-3 right-3 z-20">
              <div className="flex items-center gap-2 rounded-lg bg-black/50 px-3 py-2 backdrop-blur-sm">
                <Music className="h-4 w-4 text-white" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-white">
                    {currentStory.music_name}
                  </p>
                  {currentStory.music_artist && (
                    <p className="truncate text-xs text-white/70">
                      {currentStory.music_artist}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Story content */}
          <div className="flex h-full items-center justify-center pt-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStory.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full"
              >
                {currentStory.media ? (
                  currentStory.media.media_type === "video" ? (
                    <video
                      src={currentStory.media.file_url}
                      poster={getVideoPosterUrl(currentStory.media.file_url)}
                      className="h-full w-full object-contain"
                      autoPlay
                      muted
                      playsInline
                      preload="auto"
                      onEnded={goNext}
                    />
                  ) : (
                    <OptimizedImage
                      src={currentStory.media.file_url}
                      alt="Story"
                      preset="story"
                      eager
                      className="h-full w-full object-contain"
                    />
                  )
                ) : currentStory.content ? (
                  <div
                    className="flex h-full w-full items-center justify-center p-8 text-center"
                    style={{
                      backgroundColor:
                        currentStory.background_color || "#1a1a2e",
                    }}
                  >
                    <p className="break-words text-2xl font-bold text-white">
                      {currentStory.content}
                    </p>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Reactions and reply (non-owner) */}
          {!isOwner && (
            <div className="absolute bottom-4 left-3 right-3 z-20 space-y-2">
              <StoryReactions
                storyId={currentStory.id}
                userId={userId}
              />
              <StoryReplyInput
                storyId={currentStory.id}
                userId={userId}
              />
            </div>
          )}
        </div>

        <ConfirmationDialog
          isOpen={showBlockConfirm}
          onClose={() => setShowBlockConfirm(false)}
          onConfirm={() => {
            blockUser.mutate(storyAuthorId, {
              onSuccess: () => {
                toast({ title: "User blocked" });
                onClose();
              },
            });
            setShowBlockConfirm(false);
          }}
          title="Block this user?"
          description="They won't be able to find your profile, posts, or stories. They won't know they've been blocked."
          confirmLabel="Block"
          destructive
          loading={blockUser.isPending}
        />
      </motion.div>
    </AnimatePresence>
  );
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
}
