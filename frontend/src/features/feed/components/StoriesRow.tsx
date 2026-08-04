import { useState } from "react";
import { Plus, Camera } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";

import { useActiveStories } from "@/features/media/hooks";
import { useFriends } from "@/features/friends/hooks";
import { StoryViewer } from "@/features/media/components/StoryViewer";
import { StoryCreator } from "@/features/media/components/StoryCreator";
import { MusicStoryCreator } from "@/features/media/components/MusicStoryCreator";
import { useUploadToMedia } from "../hooks";
import type { Media, Story } from "@/types";

export function StoriesRow() {
  const { user } = useAuthStore();
  const userId = user?.id || "";
  const { data: friends = [] } = useFriends(userId || undefined);
  const friendUserIds = friends.map((f) => f.id);
  const allUserIds = userId ? [userId, ...friendUserIds].join(",") : undefined;
  const { data: stories = [] } = useActiveStories(allUserIds || "");
  const [viewingStories, setViewingStories] = useState<{ stories: Story[]; index: number } | null>(null);
  const [storyCreatorOpen, setStoryCreatorOpen] = useState(false);
  const [musicStoryOpen, setMusicStoryOpen] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<Media | null>(null);
  const { upload, isUploading } = useUploadToMedia();

  const handleStoryUpload = async (files: File[]) => {
    const media = await upload(files);
    if (media[0]) setUploadedMedia(media[0]);
  };

  return (
    <>
      <div className="rounded-2xl glass-card p-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setStoryCreatorOpen(true)}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className="relative h-16 w-16 rounded-full border-2 border-dashed border-primary/30 p-0.5 transition-all hover:border-primary/60 hover:shadow-glow">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Your story"
                  width={64}
                  height={64}
                  loading="eager"
                  decoding="async"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {(user?.full_name || "U")[0].toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                <Plus className="h-3 w-3" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground">Your Story</span>
          </button>

          {stories.map((story) => {
            const userStories = stories.filter(s => s.user_id === story.user_id);
            const startIndex = userStories.findIndex(s => s.id === story.id);
            return (
              <button
                key={story.id}
                onClick={() => setViewingStories({ stories: userStories, index: Math.max(0, startIndex) })}
                className="flex flex-col items-center gap-2 flex-shrink-0"
                aria-label={`Story from user`}
              >
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-gradient-to-br from-primary to-purple-500 p-0.5 transition-all hover:scale-105 shadow-glow">
                  {story.media ? (
                    <img
                      src={getCloudinaryTransformedUrl(story.media.thumbnail_url || story.media.file_url, "thumbnail")}
                      alt="Story"
                      width={64}
                      height={64}
                      loading="eager"
                      decoding="async"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center rounded-full"
                      style={{ backgroundColor: story.background_color || "#1a1a2e" }}
                    >
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <span className="max-w-[64px] truncate text-[11px] text-muted-foreground">
                  Story
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {viewingStories && (
        <StoryViewer
          stories={viewingStories.stories}
          userId={userId}
          initialIndex={viewingStories.index}
          onClose={() => setViewingStories(null)}
        />
      )}

      <AnimatePresence>
        {storyCreatorOpen && (
          <StoryCreator
            userId={userId}
            onClose={() => {
              setStoryCreatorOpen(false);
              setUploadedMedia(null);
            }}
            onUpload={handleStoryUpload}
            isUploading={isUploading}
            uploadedMedia={uploadedMedia || undefined}
            onOpenMusicStory={() => {
              setStoryCreatorOpen(false);
              setMusicStoryOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {musicStoryOpen && (
          <MusicStoryCreator
            userId={userId}
            onClose={() => setMusicStoryOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
