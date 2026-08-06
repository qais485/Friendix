import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  useUserHighlights,
  useCreateHighlight,
  useDeleteHighlight,
} from "../hooks";
import type { StoryHighlight } from "@/types";

interface StoryHighlightsProps {
  userId: string;
  onSelectHighlight?: (highlight: StoryHighlight) => void;
}

export function StoryHighlights({ userId, onSelectHighlight }: StoryHighlightsProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const { data: highlights = [], isLoading } = useUserHighlights(userId || undefined);
  const createHighlight = useCreateHighlight();
  const deleteHighlight = useDeleteHighlight();

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createHighlight.mutateAsync({ title: newTitle });
    setNewTitle("");
    setShowCreate(false);
  };

  const handleDelete = async (highlightId: string) => {
    if (confirm("Delete this highlight?")) {
      await deleteHighlight.mutateAsync(highlightId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Story Highlights</h3>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Highlight
        </Button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden rounded-2xl glass-card p-4"
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Highlight title"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              maxLength={100}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!newTitle.trim() || createHighlight.isPending}
              >
                {createHighlight.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowCreate(false);
                  setNewTitle("");
                }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {highlights.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
          <Star className="h-12 w-12 text-muted-foreground/30" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            No highlights yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Save your favorite stories as highlights
          </p>
          <Button size="sm" className="mt-4" onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create your first highlight
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {highlights.map((highlight) => (
            <motion.button
              key={highlight.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => onSelectHighlight?.(highlight)}
              className="group relative overflow-hidden rounded-xl"
            >
              <div className="aspect-[9/16] bg-gradient-to-br from-primary/20 to-primary/5">
                {highlight.cover_url ? (
                  <OptimizedImage
                    src={highlight.cover_url}
                    alt={highlight.title}
                    preset="story"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Star className="h-8 w-8 text-primary/40" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="truncate text-xs font-semibold text-white">
                  {highlight.title}
                </p>
              </div>
              <div className="absolute right-1 top-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(highlight.id);
                  }}
                  className="rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
