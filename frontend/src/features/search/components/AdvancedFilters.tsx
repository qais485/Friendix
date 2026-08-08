import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SearchFilters } from "@/types/search";

interface AdvancedFiltersProps {
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const POST_TYPES = ["all", "text", "image", "video", "poll"] as const;

export function AdvancedFilters({
  filters,
  onApply,
  onClear,
  isOpen,
  onClose,
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({});
    onClear();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-3xl glass-card p-4 shadow-float"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Filters</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Post Type
                </label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {POST_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          post_type: type === "all" ? undefined : type,
                        }))
                      }
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                        (type === "all" && !localFilters.post_type) ||
                          localFilters.post_type === type
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Date Range
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={localFilters.date_from ?? ""}
                    onChange={(e) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        date_from: e.target.value || undefined,
                      }))
                    }
                    className="rounded-lg border bg-background px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="date"
                    value={localFilters.date_to ?? ""}
                    onChange={(e) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        date_to: e.target.value || undefined,
                      }))
                    }
                    className="rounded-lg border bg-background px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs"
                onClick={handleClear}
              >
                Clear
              </Button>
              <Button size="sm" className="flex-1 text-xs" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
