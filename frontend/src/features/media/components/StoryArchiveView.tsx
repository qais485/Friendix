import { motion } from "framer-motion";
import { Archive, Camera, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";


import { useArchivedStories, useUnarchiveStory, useDeleteStory } from "../hooks";
import type { Story } from "@/types";

interface StoryArchiveViewProps {
  userId: string;
  onViewStory?: (stories: Story[]) => void;
}

export function StoryArchiveView({ userId, onViewStory }: StoryArchiveViewProps) {
  const { data: archivedStories = [], isLoading } = useArchivedStories(userId || undefined);
  const unarchiveStory = useUnarchiveStory();
  const deleteStory = useDeleteStory();

  const handleUnarchive = async (storyId: string) => {
    await unarchiveStory.mutateAsync(storyId);
  };

  const handleDelete = async (storyId: string) => {
    if (confirm("Permanently delete this story?")) {
      await deleteStory.mutateAsync(storyId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Story Archive</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Archive className="h-4 w-4" />
          {archivedStories.length} archived
        </div>
      </div>

      {archivedStories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Archive className="h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            No archived stories
          </p>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Stories you archive will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {archivedStories.map((story) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative overflow-hidden rounded-xl"
            >
              <button
                onClick={() => onViewStory?.([story])}
                className="aspect-[9/16] w-full"
              >
                {story.media ? (
                  <OptimizedImage
                    src={story.media.thumbnail_url || story.media.file_url}
                    alt="Archived story"
                    preset="story"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full items-center justify-center"
                    style={{ backgroundColor: story.background_color || "#1a1a2e" }}
                  >
                    <Camera className="h-6 w-6 text-white/50" />
                  </div>
                )}
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleUnarchive(story.id)}
                    className="rounded-full bg-white/20 p-1 text-white hover:bg-white/30"
                    title="Restore"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(story.id)}
                    className="rounded-full bg-white/20 p-1 text-white hover:bg-red-500/50"
                    title="Delete permanently"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                <p className="text-xs text-white/70">
                  {new Date(story.created_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
