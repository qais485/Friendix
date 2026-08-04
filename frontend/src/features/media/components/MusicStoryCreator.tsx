import { useState } from "react";
import { motion } from "framer-motion";
import { X, Music, Send, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateStory } from "../hooks";

interface MusicStoryCreatorProps {
  userId: string;
  onClose: () => void;
}

const SAMPLE_TRACKS = [
  { id: "1", name: "Blinding Lights", artist: "The Weeknd", cover: "", url: "" },
  { id: "2", name: "Shape of You", artist: "Ed Sheeran", cover: "", url: "" },
  { id: "3", name: "Levitating", artist: "Dua Lipa", cover: "", url: "" },
  { id: "4", name: "Stay", artist: "The Kid LAROI & Justin Bieber", cover: "", url: "" },
  { id: "5", name: "Peaches", artist: "Justin Bieber", cover: "", url: "" },
  { id: "6", name: "Good 4 U", artist: "Olivia Rodrigo", cover: "", url: "" },
];

export function MusicStoryCreator({ userId: _userId, onClose }: MusicStoryCreatorProps) {
  const [selectedTrack, setSelectedTrack] = useState<typeof SAMPLE_TRACKS[0] | null>(null);
  const [textContent, setTextContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#1a1a2e");
  const [searchQuery, setSearchQuery] = useState("");
  const createStory = useCreateStory();

  const bgColors = [
    "#1a1a2e", "#16213e", "#0f3460", "#533483",
    "#e94560", "#ff6b6b", "#feca57", "#48dbfb",
  ];

  const filteredTracks = SAMPLE_TRACKS.filter(
    (track) =>
      track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!selectedTrack) return;
    await createStory.mutateAsync({
      content: textContent || undefined,
      background_color: backgroundColor,
      story_type: "music",
      music_url: selectedTrack.url,
      music_name: selectedTrack.name,
      music_artist: selectedTrack.artist,
      music_cover_url: selectedTrack.cover || undefined,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-3 top-3"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <h2 className="mb-4 text-xl font-bold">Create Music Story</h2>

        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search music..."
            className="w-full rounded-lg border bg-background pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="mb-4 max-h-48 space-y-2 overflow-y-auto">
          {filteredTracks.map((track) => (
            <button
              key={track.id}
              onClick={() => setSelectedTrack(track)}
              className={`flex w-full items-center gap-3 rounded-lg p-2 transition-colors ${
                selectedTrack?.id === track.id
                  ? "bg-primary/20 ring-2 ring-primary"
                  : "hover:bg-muted"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Music className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{track.name}</p>
                <p className="text-xs text-muted-foreground">{track.artist}</p>
              </div>
            </button>
          ))}
        </div>

        {selectedTrack && (
          <div className="mb-4 space-y-3">
            <div
              className="flex min-h-[120px] items-center justify-center rounded-xl p-4 transition-colors"
              style={{ backgroundColor }}
            >
              <div className="text-center">
                <Music className="mx-auto mb-2 h-8 w-8 text-white/80" />
                <p className="text-sm font-bold text-white">{selectedTrack.name}</p>
                <p className="text-xs text-white/70">{selectedTrack.artist}</p>
              </div>
            </div>

            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Add a caption..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
              maxLength={300}
            />

            <div className="flex gap-2 overflow-x-auto pb-2">
              {bgColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  className={`h-8 w-8 flex-shrink-0 rounded-full transition-all ${
                    backgroundColor === color
                      ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-background"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        <Button
          className="w-full"
          disabled={!selectedTrack || createStory.isPending}
          onClick={handleCreate}
        >
          {createStory.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Share Music Story
        </Button>
      </motion.div>
    </motion.div>
  );
}
