import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Hash, Loader2, TrendingUp, Sparkles } from "lucide-react";
import { useTrendingHashtags, useSearchHashtags } from "./hooks";
import { HashtagCard } from "./components/HashtagCard";
import type { TrendingHashtag, Hashtag } from "@/types";

export function HashtagExplorePage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: trending, isPending: trendingPending } = useTrendingHashtags(30);
  const { data: searchResults, isPending: searchPending } = useSearchHashtags(
    debouncedQuery,
    30
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, 300);
  };

  const displayHashtags: (TrendingHashtag | Hashtag)[] | undefined = debouncedQuery ? searchResults : trending;
  const isLoading = debouncedQuery ? searchPending : trendingPending;

  return (
    <div className="min-h-screen bg-background bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="flex items-center gap-3 pt-12 md:pt-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 shadow-card transition-all duration-200">
              <Hash className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight">Hashtags</h1>
              <p className="text-sm text-muted-foreground">
                Discover trending topics and follow what matters to you
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search hashtags..."
              className="w-full rounded-xl bg-muted/80 py-2.5 pl-10 pr-4 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:shadow-elevated"
              autoFocus
            />
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-10"
              >
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </motion.div>
            )}

            {!isLoading && debouncedQuery && displayHashtags && displayHashtags.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl glass-card p-6 sm:p-8 text-center transition-all duration-200"
              >
                <Search className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 text-muted-foreground">
                  No hashtags found for "{debouncedQuery}"
                </p>
              </motion.div>
            )}

            {!isLoading && debouncedQuery && displayHashtags && displayHashtags.length > 0 && (
              <motion.div
                key="search-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 px-1">
                  <Search className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-bold text-muted-foreground">
                    Search Results
                  </h3>
                </div>
                {displayHashtags.map((tag, i) => (
                  <HashtagCard key={tag.id} hashtag={tag} index={i} />
                ))}
              </motion.div>
            )}

            {!isLoading && !debouncedQuery && (
              <motion.div
                key="trending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Trending Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold">Trending Now</h3>
                  </div>
                  {trending && trending.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {trending.slice(0, 6).map((tag, i) => (
                        <HashtagCard key={tag.id} hashtag={tag} index={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl glass-card p-6 sm:p-8 text-center transition-all duration-200">
                      <Sparkles className="mx-auto h-10 w-10 text-muted-foreground/40" />
                      <p className="mt-3 text-sm text-muted-foreground">
                        No trending hashtags yet. Be the first to create one!
                      </p>
                    </div>
                  )}
                </div>

                {/* Full Trending List */}
                {trending && trending.length > 6 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-bold text-muted-foreground">
                        All Trending
                      </h3>
                    </div>
                    {trending.slice(6).map((tag, i) => (
                      <HashtagCard key={tag.id} hashtag={tag} index={i + 6} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
