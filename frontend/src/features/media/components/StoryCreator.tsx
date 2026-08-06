import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Type, Music, Send, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { getVideoPosterUrl } from "@/lib/cloudinaryTransform";

import { UploadZone } from "./UploadZone";
import { useCreateStory } from "../hooks";
import type { Media } from "@/types";

interface StoryCreatorProps {
  userId: string;
  onClose: () => void;
  onUpload: (files: File[]) => void;
  isUploading?: boolean;
  uploadedMedia?: Media;
  onOpenMusicStory?: () => void;
}

export function StoryCreator({
  userId: _userId,
  onClose,
  onUpload,
  isUploading,
  uploadedMedia,
  onOpenMusicStory,
}: StoryCreatorProps) {
  const [mode, setMode] = useState<"media" | "text">("media");
  const [textContent, setTextContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#1a1a2e");
  const [isCloseFriendsOnly, setIsCloseFriendsOnly] = useState(false);
  const createStory = useCreateStory();

  const bgColors = [
    "#1a1a2e",
    "#16213e",
    "#0f3460",
    "#533483",
    "#e94560",
    "#ff6b6b",
    "#feca57",
    "#48dbfb",
    "#ff9ff3",
    "#54a0ff",
    "#00d2d3",
    "#10ac84",
  ];

  const handleCreateTextStory = async () => {
    if (!textContent.trim()) return;
    await createStory.mutateAsync({
      content: textContent,
      background_color: backgroundColor,
      story_type: "text",
      is_close_friends_only: isCloseFriendsOnly,
    });
    onClose();
  };

  const handleCreateMediaStory = async () => {
    if (!uploadedMedia) return;
    await createStory.mutateAsync({
      media_id: uploadedMedia.id,
      story_type: "media",
      is_close_friends_only: isCloseFriendsOnly,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl"
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-3 top-3"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <h2 className="mb-4 text-xl font-bold">Create Story</h2>

        <div className="mb-4 flex gap-2">
          <Button
            variant={mode === "media" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("media")}
            className="flex-1"
          >
            <Camera className="mr-2 h-4 w-4" />
            Photo/Video
          </Button>
          <Button
            variant={mode === "text" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("text")}
            className="flex-1"
          >
            <Type className="mr-2 h-4 w-4" />
            Text
          </Button>
          {onOpenMusicStory && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenMusicStory}
              className="flex-1"
            >
              <Music className="mr-2 h-4 w-4" />
              Music
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {mode === "media" && (
            <motion.div
              key="media"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {uploadedMedia ? (
                <div className="relative overflow-hidden rounded-xl">
                  {uploadedMedia.media_type === "video" ? (
                    <video
                      src={uploadedMedia.file_url}
                      poster={getVideoPosterUrl(uploadedMedia.file_url)}
                      className="w-full rounded-xl"
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <OptimizedImage
                      src={uploadedMedia.file_url}
                      alt="Upload preview"
                      preset="feed"
                      eager
                      className="w-full rounded-xl object-cover"
                      style={{ maxHeight: "300px" }}
                    />
                  )}
                  <div className="absolute bottom-2 right-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-black/50 text-white hover:bg-black/70"
                      onClick={onClose}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              ) : (
                <UploadZone
                  onUpload={onUpload}
                  isUploading={isUploading}
                  accept={["image", "video"]}
                  multiple={false}
                  maxFiles={1}
                />
              )}
              <button
                onClick={() => setIsCloseFriendsOnly(!isCloseFriendsOnly)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  isCloseFriendsOnly
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Users className="h-4 w-4" />
                {isCloseFriendsOnly ? "Close Friends" : "Everyone"}
              </button>

              <Button
                className="w-full"
                disabled={!uploadedMedia || isUploading}
                onClick={handleCreateMediaStory}
              >
                {createStory.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Share Story
              </Button>
            </motion.div>
          )}

          {mode === "text" && (
            <motion.div
              key="text"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div
                className="flex min-h-[200px] items-center justify-center rounded-xl p-4 transition-colors"
                style={{ backgroundColor }}
              >
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full bg-transparent text-center text-xl font-bold text-white placeholder-white/50 focus:outline-none resize-none"
                  maxLength={300}
                  rows={4}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {bgColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBackgroundColor(color)}
                    className={cn(
                      "h-9 w-9 flex-shrink-0 rounded-full transition-all",
                      backgroundColor === color
                        ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-background"
                        : "hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <p className="text-right text-xs text-muted-foreground">
                {textContent.length}/300
              </p>

              <button
                onClick={() => setIsCloseFriendsOnly(!isCloseFriendsOnly)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  isCloseFriendsOnly
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Users className="h-4 w-4" />
                {isCloseFriendsOnly ? "Close Friends" : "Everyone"}
              </button>

              <Button
                className="w-full"
                disabled={!textContent.trim() || createStory.isPending}
                onClick={handleCreateTextStory}
              >
                {createStory.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Share Story
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
