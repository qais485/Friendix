import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FEED_SORT_OPTIONS } from "@/types";
import type { FeedSortBy } from "@/types";
import { cn } from "@/lib/utils";

interface FeedFiltersProps {
  sortBy: FeedSortBy;
  onSortChange: (sort: FeedSortBy) => void;
}

export function FeedFilters({ sortBy, onSortChange }: FeedFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="flex shrink-0 gap-1">
        {FEED_SORT_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant="ghost"
            size="sm"
            onClick={() => onSortChange(option.value as FeedSortBy)}
            className={cn(
              "rounded-full px-3 text-xs font-medium transition-all",
              sortBy === option.value
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
