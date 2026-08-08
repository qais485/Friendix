import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Image, Film, Music, FileText, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaType } from "@/types";

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  isUploading?: boolean;
  accept?: MediaType[];
  multiple?: boolean;
  className?: string;
  maxFiles?: number;
  compressionEnabled?: boolean;
}

const ACCEPT_MAP: Record<MediaType, string[]> = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "application/zip",
  ],
  live_photo: ["image/jpeg", "image/png", "video/mp4", "video/quicktime"],
  all: [],
};

const TYPE_ICONS: Record<MediaType, typeof Image> = {
  image: Image,
  video: Film,
  audio: Music,
  document: FileText,
  live_photo: Camera,
  all: Image,
};

const TYPE_LABELS: Record<MediaType, string> = {
  image: "Photos",
  video: "Videos",
  audio: "Audio",
  document: "Files",
  live_photo: "Live Photos",
  all: "All",
};

export function UploadZone({
  onUpload,
  isUploading = false,
  accept = ["image", "video", "audio", "document"],
  multiple = true,
  className,
  maxFiles = 20,
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedMimeTypes = accept.flatMap((type) => ACCEPT_MAP[type] || []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files).slice(0, maxFiles);
      if (files.length > 0) {
        setSelectedCount(files.length);
        onUpload(files);
      }
    },
    [onUpload, maxFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).slice(0, maxFiles);
      if (files.length > 0) {
        setSelectedCount(files.length);
        onUpload(files);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onUpload, maxFiles]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 sm:p-8",
        isDragOver
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        isUploading && "pointer-events-none opacity-60",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedMimeTypes.join(",")}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4">
        {isUploading ? (
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            {selectedCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {selectedCount}
              </span>
            )}
          </div>
        ) : (
          <div className="relative">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
                isDragOver ? "bg-primary/20" : "bg-muted"
              )}
            >
              <Upload
                className={cn(
                  "h-6 w-6 transition-colors",
                  isDragOver ? "text-primary" : "text-muted-foreground/50"
                )}
              />
            </div>
            {multiple && maxFiles > 1 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/20 text-[9px] font-medium text-muted-foreground">
                {maxFiles}
              </span>
            )}
          </div>
        )}

        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isUploading
              ? `Uploading ${selectedCount > 0 ? `${selectedCount} files` : "..."}`
              : isDragOver
              ? "Drop files here"
              : "Drag & drop files here"}
          </p>
          {!isUploading && (
            <p className="text-xs text-muted-foreground">
              or{" "}
              <button
                type="button"
                onClick={handleClick}
                className="font-medium text-primary hover:underline"
              >
                browse files
              </button>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {accept.map((type) => {
            const Icon = TYPE_ICONS[type];
            return (
              <span
                key={type}
                className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
              >
                <Icon className="h-3 w-3" />
                {TYPE_LABELS[type]}
              </span>
            );
          })}
        </div>

        {multiple && (
          <p className="text-[11px] text-muted-foreground/60">
            Max {maxFiles} files at once
          </p>
        )}
      </div>
    </motion.div>
  );
}
