import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  SlidersHorizontal,
  BookmarkPlus,
  Users,
  FileText,
  Film,
  MessageCircle,
  Radio,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearch, useSaveSearch } from "./hooks";
import { useSearchHashtags } from "@/features/hashtags/hooks";
import { UserSearchResults } from "./components/UserSearchResults";
import { PostSearchResults } from "./components/PostSearchResults";
import { ReelSearchResults } from "./components/ReelSearchResults";
import { CommentSearchResults } from "./components/CommentSearchResults";
import { LiveSearchResults } from "./components/LiveSearchResults";
import { HashtagSearchResults } from "./components/HashtagSearchResults";
import { SearchHistory } from "./components/SearchHistory";
import { SavedSearches } from "./components/SavedSearches";
import { AdvancedFilters } from "./components/AdvancedFilters";
import type { SearchType, SearchFilters } from "@/types/search";

const TABS: { key: SearchType | "hashtags"; label: string; icon: typeof Users }[] = [
  { key: "all", label: "All", icon: Search },
  { key: "users", label: "Users", icon: Users },
  { key: "posts", label: "Posts", icon: FileText },
  { key: "reels", label: "Reels", icon: Film },
  { key: "comments", label: "Comments", icon: MessageCircle },
  { key: "lives", label: "Live", icon: Radio },
  { key: "hashtags", label: "Hashtags", icon: Hash },
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchType | "hashtags">("all");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: results, isPending } = useSearch(
    activeTab !== "hashtags" ? debouncedQuery : "",
    activeTab === "hashtags" ? "all" : activeTab,
    filters
  );
  const { data: hashtagResults, isPending: hashtagPending } = useSearchHashtags(
    activeTab === "hashtags" ? debouncedQuery : "",
    30
  );
  const { mutate: saveSearch, isPending: isSaving } = useSaveSearch();

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [debouncedQuery]);

  const handleSelectHistory = useCallback(
    (q: string, type: SearchType) => {
      setQuery(q);
      setActiveTab(type === "all" ? "all" : type);
    },
    []
  );

  const handleSaveSearch = () => {
    if (!debouncedQuery) return;
    saveSearch({
      query: debouncedQuery,
      search_type: activeTab,
      label: debouncedQuery,
    });
  };

  const hasResults =
    results &&
    (results.users.length > 0 ||
      results.posts.length > 0 ||
      results.reels.length > 0 ||
      results.comments.length > 0 ||
      results.lives.length > 0);

  const hasHashtagResults =
    activeTab === "hashtags" && hashtagResults && hashtagResults.length > 0;

  const isSearching = activeTab === "hashtags" ? hashtagPending : isPending;

  return (
    <div className="min-h-screen bg-background bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="pt-12 md:pt-0">
            <h1 className="text-2xl font-bold tracking-tight">Search</h1>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users, posts, reels..."
              className="w-full rounded-xl bg-muted/80 py-2.5 pl-10 pr-20 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:shadow-elevated"
              autoFocus
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {debouncedQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl transition-all duration-200 hover:bg-muted"
                  onClick={handleSaveSearch}
                  disabled={isSaving}
                  title="Save search"
                >
                  <BookmarkPlus className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl transition-all duration-200 hover:bg-muted"
                onClick={() => setShowFilters(true)}
                title="Advanced filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map((tab) => (
              <Button
                key={tab.key}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "rounded-xl px-3.5 py-2 text-xs font-medium transition-all duration-200 shrink-0",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-card"
                    : "text-muted-foreground hover:bg-muted/80"
                )}
              >
                <tab.icon className="mr-1.5 h-3.5 w-3.5" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Filters panel */}
          <AdvancedFilters
            filters={filters}
            onApply={setFilters}
            onClear={() => setFilters({})}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
          />

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {isSearching && (
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

            {!isSearching && debouncedQuery && !hasResults && !hasHashtagResults && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl glass-card p-8 text-center transition-all duration-200"
              >
                <Search className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 break-words text-muted-foreground">
                  No results found for "{debouncedQuery}"
                </p>
              </motion.div>
            )}

            {!isSearching && debouncedQuery && hasHashtagResults && activeTab === "hashtags" && (
              <motion.div
                key="hashtag-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-muted-foreground">
                    Hashtags
                  </h3>
                  <HashtagSearchResults hashtags={hashtagResults!} />
                </div>
              </motion.div>
            )}

            {!isSearching && debouncedQuery && hasResults && activeTab !== "hashtags" && (
              <motion.div
                key={`results-${activeTab}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {(activeTab === "all" || activeTab === "users") &&
                  results!.users.length > 0 && (
                    <div className="space-y-4">
                      {activeTab === "all" && (
                        <h3 className="text-sm font-bold text-muted-foreground">
                          Users
                        </h3>
                      )}
                      <UserSearchResults users={results!.users} />
                    </div>
                  )}

                {(activeTab === "all" || activeTab === "posts") &&
                  results!.posts.length > 0 && (
                    <div className="space-y-4 mt-4">
                      {activeTab === "all" && (
                        <h3 className="text-sm font-bold text-muted-foreground">
                          Posts
                        </h3>
                      )}
                      <PostSearchResults posts={results!.posts} />
                    </div>
                  )}

                {(activeTab === "all" || activeTab === "reels") &&
                  results!.reels.length > 0 && (
                    <div className="space-y-4 mt-4">
                      {activeTab === "all" && (
                        <h3 className="text-sm font-bold text-muted-foreground">
                          Reels
                        </h3>
                      )}
                      <ReelSearchResults reels={results!.reels} />
                    </div>
                  )}

                {(activeTab === "all" || activeTab === "comments") &&
                  results!.comments.length > 0 && (
                    <div className="space-y-4 mt-4">
                      {activeTab === "all" && (
                        <h3 className="text-sm font-bold text-muted-foreground">
                          Comments
                        </h3>
                      )}
                      <CommentSearchResults comments={results!.comments} />
                    </div>
                  )}

                {(activeTab === "all" || activeTab === "lives") &&
                  results!.lives.length > 0 && (
                    <div className="space-y-4 mt-4">
                      {activeTab === "all" && (
                        <h3 className="text-sm font-bold text-muted-foreground">
                          Live
                        </h3>
                      )}
                      <LiveSearchResults lives={results!.lives} />
                    </div>
                  )}
              </motion.div>
            )}

            {!debouncedQuery && (
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <SearchHistory onSelect={handleSelectHistory} />
                <SavedSearches onSelect={handleSelectHistory} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
