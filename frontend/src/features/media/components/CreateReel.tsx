import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Film, Globe, Users, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVideoPosterUrl } from "@/lib/cloudinaryTransform";
import { UploadZone } from "./UploadZone";
import { useCreateReel, useUploadMedia } from "../hooks";
import { useToast } from "@/hooks/useToast";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Media, Reel } from "@/types";

interface CreateReelProps {
  onClose: () => void;
  onCreated?: (reel: Reel) => void;
}

type Privacy = "everyone" | "friends" | "only_me";

const PRIVACY_OPTIONS: { value: Privacy; label: string; icon: typeof Globe }[] = [
  { value: "everyone", label: "Public", icon: Globe },
  { value: "friends", label: "Friends", icon: Users },
  { value: "only_me", label: "Only Me", icon: Lock },
];

export function CreateReel({ onClose, onCreated }: CreateReelProps) {
  const [step, setStep] = useState<"upload" | "details">("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>("everyone");
  const [uploadedMedia, setUploadedMedia] = useState<Media | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMedia = useUploadMedia();
  const createReel = useCreateReel();
  const { toast } = useToast();

  const handleUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    let fileUrl: string;
    try {
      ({ url: fileUrl } = await uploadToCloudinary(file, "video"));
    } catch {
      setIsUploading(false);
      setPreviewUrl(null);
      toast({ title: "Upload failed", description: "Failed to upload video to Cloudinary. Please try again.", variant: "destructive" });
      return;
    }

    const mediaData = {
      media_type: "video" as const,
      file_url: fileUrl,
      original_name: file.name,
      mime_type: file.type,
      file_size: file.size,
      is_processed: false,
    };

    try {
      const media = await uploadMedia.mutateAsync(mediaData);
      setUploadedMedia(media);
      setStep("details");
    } catch {
      toast({ title: "Upload failed", description: "Failed to save media. Please try again.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!uploadedMedia) return;

    try {
      const reel = await createReel.mutateAsync({
        media_id: uploadedMedia.id,
        caption: caption || undefined,
        privacy,
      });
      onCreated?.(reel);
      onClose();
    } catch {
      toast({ title: "Failed to create reel", description: "Please try again.", variant: "destructive" });
    }
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
        className="relative w-full max-w-lg rounded-2xl bg-background p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-3 top-3"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="mb-6">
          <h2 className="text-xl font-bold">Create Reel</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === "upload"
              ? "Upload a video to create your reel"
              : "Add details to your reel"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <UploadZone
                onUpload={handleUpload}
                isUploading={isUploading}
                accept={["video"]}
                multiple={false}
                maxFiles={1}
              />
            </motion.div>
          )}

          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {previewUrl && (
                <div className="relative overflow-hidden rounded-xl bg-black">
                  <video
                    src={previewUrl}
                    poster={getVideoPosterUrl(previewUrl)}
                    className="w-full max-h-[300px] object-contain"
                    controls
                    muted
                    preload="metadata"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  maxLength={2200}
                />
                <p className="text-right text-xs text-muted-foreground">
                  {caption.length}/2200
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Privacy</label>
                <div className="flex flex-wrap gap-2">
                  {PRIVACY_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={privacy === option.value ? "default" : "outline"}
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => setPrivacy(option.value)}
                    >
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep("upload");
                    setUploadedMedia(null);
                    setPreviewUrl(null);
                  }}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!uploadedMedia || createReel.isPending}
                  onClick={handleCreate}
                >
                  {createReel.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Film className="mr-2 h-4 w-4" />
                  )}
                  Share Reel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
