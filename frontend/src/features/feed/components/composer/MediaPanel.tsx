import { useState } from "react";
import { Loader2, UploadCloud, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";

interface MediaPanelProps {
  kind: "image" | "video";
  imageUrls: string[];
  videoUrl: string | null;
  isUploading: boolean;
  onFiles: (files: File[]) => void;
  onPick: () => void;
  onRemoveImage: (index: number) => void;
  onClearVideo: () => void;
}

export const MAX_IMAGES = 6;

export function MediaPanel({
  kind,
  imageUrls,
  videoUrl,
  isUploading,
  onFiles,
  onPick,
  onRemoveImage,
  onClearVideo,
}: MediaPanelProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFiles(Array.from(files));
  };

  const showDropzone =
    (kind === "image" && imageUrls.length === 0) ||
    (kind === "video" && !videoUrl);

  return (
    <div className="space-y-3">
      {showDropzone && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={onPick}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium">
            {kind === "image" ? "Drop your photos here" : "Drop your video here"}
          </div>
          <div className="text-xs text-muted-foreground">
            or click to browse {kind === "image" ? `(up to ${MAX_IMAGES})` : ""}
          </div>
        </div>
      )}

      {isUploading && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Uploading media...
        </div>
      )}

      {kind === "image" && imageUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {imageUrls.map((url, index) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-xl">
              <img src={getCloudinaryTransformedUrl(url, "thumbnail")} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveImage(index)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Cover
                </span>
              )}
            </div>
          ))}
          {imageUrls.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={onPick}
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-muted text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <Plus className="h-6 w-6" />
            </button>
          )}
        </div>
      )}

      {kind === "video" && videoUrl && (
        <div className="relative overflow-hidden rounded-xl">
          <video
            src={videoUrl}
            className="max-h-[320px] w-full rounded-xl"
            controls
            preload="metadata"
          />
          <button
            type="button"
            onClick={onClearVideo}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
