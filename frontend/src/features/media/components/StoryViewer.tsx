import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";

import {
  useViewStory,
  useDeleteStory,
  useArchiveStory,
  useAddStoryToHighlight,
  useUserHighlights,
} from "../hooks";
import { useRelationshipSummary, useSendFriendRequest, useFollow, useBlockUser } from "@/features/friends/hooks";
import { useToast } from "@/hooks/useToast";
import { StoryReactions } from "./StoryReactions";
import { StoryReplyInput } from "./StoryReplyInput";
import type { Story } from "@/types";

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
  const [showHighlights, setShowHighlights] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
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

  useEffect(() => {
    if (currentStory) {
      viewStory.mutate(currentStory.id);
    }
  }, [currentStory?.id]);

  useEffect(() => {
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [goNext]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onClose]);

  if (!currentStory) return null;

  const timeLeft = Math.max(
    0,
    Math.floor(
      (new Date(currentStory.expires_at).getTime() - Date.now()) / 1000 / 60 / 60
    )
  );

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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      >
        <div className="relative h-full w-full max-w-md">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {!isOwner && relationship && (
            <div className="absolute right-14 top-4 z-10 flex items-center gap-2">
              {!relationship.are_friends && !relationship.are_blocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 gap-1.5"
                  onClick={() => sendFriendRequest.mutate(storyAuthorId, { onSuccess: () => toast({ title: "Friend request sent" }) })}
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
                  onClick={() => followUser.mutate(storyAuthorId, { onSuccess: () => toast({ title: "Following" }) })}
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

          {isOwner && (
            <div className="absolute left-4 top-4 z-10 flex gap-2">
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

          {showHighlights && isOwner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-4 top-16 z-20 w-64 rounded-xl bg-background p-3 shadow-xl"
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
                        <img
                          src={highlight.cover_url}
                          alt=""
                          width={32}
                          height={32}
                          loading="lazy"
                          decoding="async"
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

          <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
            {currentIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={goPrev}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}
          </div>

          <div className="absolute right-4 top-1/2 z-10 -translate-y-1/2">
            {currentIndex < stories.length - 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={goNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}
          </div>

          <div className="flex gap-1 px-4 pt-4">
            {stories.map((_, index) => (
              <div
                key={index}
                className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
              >
                <motion.div
                  className="h-full bg-white"
                  initial={{
                    width: index < currentIndex ? "100%" : "0%",
                  }}
                  animate={{
                    width:
                      index < currentIndex
                        ? "100%"
                        : index === currentIndex
                        ? "100%"
                        : "0%",
                  }}
                  transition={{
                    duration: index === currentIndex ? 5 : 0,
                    ease: "linear",
                  }}
                />
              </div>
            ))}
          </div>

          <div className="absolute left-4 top-10 z-10 flex items-center gap-2">
            <div className="flex items-center gap-2 text-white">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{timeLeft}h left</span>
            </div>
            {currentStory.is_close_friends_only && (
              <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                <Users className="h-3 w-3" />
                Close Friends
              </div>
            )}
          </div>

          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 text-white">
            <Eye className="h-4 w-4" />
            <span className="text-sm">{currentStory.views_count} views</span>
          </div>

          {currentStory.music_name && (
            <div className="absolute bottom-14 left-4 right-4 z-10">
              <div className="flex items-center gap-2 rounded-lg bg-black/50 px-3 py-2 backdrop-blur-sm">
                <Music className="h-4 w-4 text-white" />
                <div className="flex-1 min-w-0">
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

          <div className="flex h-full items-center justify-center pt-12">
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
                      className="h-full w-full object-contain"
                      autoPlay
                      muted
                      loop
                      preload="auto"
                    />
                  ) : (
                    <img
                      src={getCloudinaryTransformedUrl(currentStory.media.file_url, "story")}
                      alt="Story"
                      width={1080}
                      height={1920}
                      decoding="async"
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
                    <p className="text-2xl font-bold text-white">
                      {currentStory.content}
                    </p>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {!isOwner && (
            <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
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
      </motion.div>

      <ConfirmationDialog
        isOpen={showBlockConfirm}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={() => {
          blockUser.mutate(storyAuthorId, { onSuccess: () => { toast({ title: "User blocked" }); onClose(); } });
          setShowBlockConfirm(false);
        }}
        title="Block this user?"
        description="They won't be able to find your profile, posts, or stories. They won't know they've been blocked."
        confirmLabel="Block"
        destructive
        loading={blockUser.isPending}
      />
    </AnimatePresence>
  );
}
