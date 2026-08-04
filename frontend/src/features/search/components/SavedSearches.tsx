import { motion } from "framer-motion";
import { Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "@/lib/utils";
import { useSavedSearches, useDeleteSavedSearch } from "../hooks";
import type { SearchType } from "@/types/search";

interface SavedSearchesProps {
  onSelect: (query: string, type: SearchType) => void;
}

export function SavedSearches({ onSelect }: SavedSearchesProps) {
  const { data } = useSavedSearches();
  const { mutate: deleteSearch, isPending } = useDeleteSavedSearch();

  const saved = data?.saved_searches ?? [];

  if (saved.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Saved Searches</h3>
      </div>
      <div className="space-y-1">
        {saved.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50"
          >
            <button
              onClick={() => onSelect(item.query, item.search_type as SearchType)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <Bookmark className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{item.query}</p>
                  {item.label && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {item.label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.created_at))}
                </p>
              </div>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => deleteSearch(item.id)}
              disabled={isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
