import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Loader2, Inbox, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCard } from "./components/VideoCard";
import { useWatchHistory, useClearWatchHistory } from "./hooks";

function formatProgress(progress: number): string {
  return `${Math.round(progress * 100)}%`;
}

export function HistoryPage() {
  const { data, isLoading } = useWatchHistory();
  const clearHistory = useClearWatchHistory();

  const items = data?.items || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pt-12 md:pt-0">
            <div className="flex items-center gap-3">
              <Link
                to="/videos"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Videos
              </Link>
            </div>
            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl text-destructive hover:text-destructive transition-all duration-200 hover:shadow-card"
                onClick={() => {
                  if (window.confirm("Clear all watch history?")) {
                    clearHistory.mutate();
                  }
                }}
                disabled={clearHistory.isPending}
              >
                <Trash2 className="h-4 w-4" />
                Clear History
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 shadow-card">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Watch History</h1>
              <p className="text-sm text-muted-foreground">Videos you've watched</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl glass-card p-10 text-center">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">No watch history yet</p>
              <Link to="/videos">
                <Button className="mt-4 rounded-xl transition-all duration-200 hover:shadow-card">Browse Videos</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="relative rounded-2xl glass-card p-4 transition-all duration-200 hover:shadow-elevated"
                >
                  {item.video && (
                    <>
                      <VideoCard video={item.video} index={i} />
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {item.completed ? (
                          <span className="flex items-center gap-1 text-green-500 font-medium">
                            <CheckCircle className="h-3 w-3" /> Completed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <span className="inline-block h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                              <span
                                className="block h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${item.progress * 100}%` }}
                              />
                            </span>
                            {formatProgress(item.progress)}
                          </span>
                        )}
                        {item.watched_at && (
                          <span>
                            {new Date(item.watched_at).toLocaleDateString(undefined, {
                              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
