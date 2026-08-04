import { Type, Image, Video, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { POST_TYPES } from "@/types";

interface TypeSelectorProps {
  activeType: "text" | "image" | "video" | "poll";
  onSelect: (type: "text" | "image" | "video" | "poll") => void;
  onPickMedia: (type: "image" | "video") => void;
}

const ICONS = {
  text: Type,
  image: Image,
  video: Video,
  poll: BarChart3,
} as const;

export function TypeSelector({ activeType, onSelect, onPickMedia }: TypeSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {POST_TYPES.map((type) => {
        const value = type.value as "text" | "image" | "video" | "poll";
        const Icon = ICONS[value];
        const isActive = activeType === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => (value === "image" || value === "video" ? onPickMedia(value) : onSelect(value))}
            className={cn(
              "group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
              isActive && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
            )}
          >
            <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
            {type.label}
          </button>
        );
      })}
    </div>
  );
}
