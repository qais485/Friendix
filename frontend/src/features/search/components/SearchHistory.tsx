import { motion } from "framer-motion";
import { Clock, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDistanceToNow } from "@/lib/utils";
import { useSearchHistory, useClearSearchHistory } from "../hooks";
import type { SearchType } from "@/types/search";

interface SearchHistoryProps {
  onSelect: (query: string, type: SearchType) => void;
}

export function SearchHistory({ onSelect }: SearchHistoryProps) {
  const { data } = useSearchHistory();
  const { mutate: clearHistory, isPending } = useClearSearchHistory();

  const history = data?.history ?? [];

  if (history.length === 0) {
    return (
      <div className="rounded-3xl glass-card p-8 text-center">
        <Clock className="mx-auto h-10 w-10 text-muted-foreground/30" />
        <p className="mt-3 text-sm text-muted-foreground">
          No search history yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Recent Searches</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground"
          onClick={() => clearHistory()}
          disabled={isPending}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Clear all
        </Button>
      </div>
      <div className="space-y-1">
        {history.map((item) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => onSelect(item.query, item.search_type as SearchType)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
          >
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{item.query}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.created_at))}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                "bg-muted text-muted-foreground"
              )}
            >
              {item.search_type}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
