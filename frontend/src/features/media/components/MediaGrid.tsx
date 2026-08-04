import { MediaCard } from "./MediaCard";
import { Loader2 } from "lucide-react";
import type { Media } from "@/types";

interface MediaGridProps {
  media: Media[];
  isLoading?: boolean;
  onDelete?: (mediaId: string) => void;
  onEdit?: (media: Media) => void;
  onClick?: (media: Media, index: number) => void;
  isOwner?: boolean;
  emptyMessage?: string;
}

export function MediaGrid({
  media,
  isLoading,
  onDelete,
  onEdit,
  onClick,
  isOwner = false,
  emptyMessage = "No media yet",
}: MediaGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">{emptyMessage}</p>
        <p className="mt-1 text-sm text-muted-foreground/60">
          Upload files to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {media.map((item, index) => (
        <MediaCard
          key={item.id}
          media={item}
          onDelete={onDelete}
          onEdit={onEdit}
          onClick={(m) => onClick?.(m, index)}
          isOwner={isOwner}
        />
      ))}
    </div>
  );
}
