import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Loader2, Compass, TrendingUp, Clock, ListVideo, PlayCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCard } from "./components/VideoCard";
import { CategoryFilter } from "./components/CategoryFilter";
import { useVideoList, useTrendingVideos, useSearchVideos } from "./hooks";

type Tab = "discover" | "trending";

export function VideosPage() {
  const [tab, setTab] = useState<Tab>("discover");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const discoverFeed = useVideoList(categoryId || undefined);
  const trendingFeed = useTrendingVideos();
  const searchFeed = useSearchVideos(searchQuery);

  const isSearching = searchQuery.length > 0;
  const videos = isSearching
    ? searchFeed.data?.videos || []
    : tab === "trending"
    ? trendingFeed.data?.videos || []
    : discoverFeed.data?.videos || [];

  const isLoading = isSearching
    ? searchFeed.isLoading
    : tab === "trending"
    ? trendingFeed.isLoading
    : discoverFeed.isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between pt-12 md:pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 shadow-card">
                <PlayCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Videos</h1>
                <p className="text-sm text-muted-foreground">Watch, discover, and share</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/videos/history">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-xl transition-all duration-200 hover:shadow-card">
                  <Clock className="h-4 w-4" />
                  History
                </Button>
              </Link>
              <Link to="/videos/playlists">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-xl transition-all duration-200 hover:shadow-card">
                  <ListVideo className="h-4 w-4" />
                  Playlists
                </Button>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="w-full rounded-full glass-card py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
            />
          </div>

          {/* Tabs */}
          {!isSearching && (
            <div className="flex gap-1.5 rounded-xl bg-muted/50 p-1 w-fit">
              {[
                { key: "discover" as const, label: "Discover", icon: Compass },
                { key: "trending" as const, label: "Trending", icon: TrendingUp },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    tab === t.key
                      ? "bg-card text-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Categories (discover only) */}
          {!isSearching && tab === "discover" && (
            <CategoryFilter selected={categoryId} onSelect={setCategoryId} />
          )}

          {/* Videos grid */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : videos.length === 0 ? (
            <div className="rounded-3xl glass-card p-10 text-center">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">
                {isSearching ? `No results for "${searchQuery}"` : "No videos yet"}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video, i) => (
                <VideoCard key={video.id} video={video} index={i} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
