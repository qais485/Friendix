import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useVideoCategories } from "../hooks";
import type { VideoCategory } from "@/types/videos";

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const { data: categories = [], isLoading } = useVideoCategories();

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-24 shrink-0 rounded-full bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          selected === null
            ? "text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {selected === null && (
          <motion.div
            layoutId="category-pill"
            className="absolute inset-0 rounded-full bg-primary"
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          />
        )}
        <span className="relative z-10">All</span>
      </button>
      {categories.map((cat: VideoCategory) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            selected === cat.id
              ? "text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {selected === cat.id && (
            <motion.div
              layoutId="category-pill"
              className="absolute inset-0 rounded-full bg-primary"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="relative z-10">{cat.name}</span>
        </button>
      ))}
    </div>
  );
}
