import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ThumbsUp, Clock, ListPlus, Eye, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { VideoPlayer } from "./components/VideoPlayer";
import { VideoComments } from "./components/VideoComments";
import {
  useVideoDetail, useToggleVideoLike, useToggleWatchLater,
  useRecordWatch, useRecommendations, useAddVideoToPlaylist, useUserPlaylists,
} from "./hooks";
import { tracking } from "@/services/tracking";
import { useState } from "react";

function formatViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K views`;
  return `${count} views`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const videoId = id || "";
  const { data: video, isPending, error } = useVideoDetail(videoId);
  const likeMutation = useToggleVideoLike();
  const watchLaterMutation = useToggleWatchLater();
  const recordWatch = useRecordWatch();
  const { data: recommendations } = useRecommendations(videoId);
  const { data: playlistsData } = useUserPlaylists();
  const addVideoToPlaylist = useAddVideoToPlaylist();
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  useEffect(() => {
    if (videoId) {
      const timer = setTimeout(() => { recordWatch.mutate({ videoId, progress: 0 }); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [videoId]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !video) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="rounded-3xl glass-card p-10 text-center">
            <PlayCircle className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">Video not found</p>
            <Link to="/videos">
              <Button variant="outline" className="mt-4 rounded-xl transition-all duration-200 hover:shadow-card">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Videos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="pt-12 md:pt-0">
            <Link
              to="/videos"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Videos
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Main content */}
            <div className="space-y-5">
              <VideoPlayer
                video={video}
                onProgress={(p) => recordWatch.mutate({ videoId, progress: p })}
              />

              <div>
                <h1 className="break-words text-xl font-bold">{video.title}</h1>
                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {formatViews(video.views_count)}
                  </span>
                  <span>{formatDate(video.created_at)}</span>
                  {video.category && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary shadow-card">
                      {video.category.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={video.is_liked ? "default" : "outline"}
                  size="sm"
                  className="rounded-xl gap-1.5 transition-all duration-200 hover:shadow-card"
                  onClick={() => {
                    tracking.like({ content_type: "video", content_id: videoId, creator_id: video.user_id, context: "watch" });
                    likeMutation.mutate(videoId);
                  }}
                  disabled={likeMutation.isPending}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {video.likes_count}
                </Button>
                <Button
                  variant={video.is_watch_later ? "default" : "outline"}
                  size="sm"
                  className="rounded-xl gap-1.5 transition-all duration-200 hover:shadow-card"
                  onClick={() => {
                    tracking.save({ content_type: "video", content_id: videoId, creator_id: video.user_id, context: "watch" });
                    watchLaterMutation.mutate(videoId);
                  }}
                  disabled={watchLaterMutation.isPending}
                >
                  <Clock className="h-4 w-4" />
                  Watch Later
                </Button>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-1.5 transition-all duration-200 hover:shadow-card"
                    onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                  >
                    <ListPlus className="h-4 w-4" />
                    Save to Playlist
                  </Button>
                  {showPlaylistMenu && playlistsData?.playlists && (
                    <div className="absolute left-0 top-full z-10 mt-1.5 w-56 max-w-[calc(100vw-2rem)] rounded-2xl glass-card p-1.5">
                      {playlistsData.playlists.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-muted-foreground">No playlists yet</p>
                      ) : (
                        playlistsData.playlists.map((pl) => (
                          <button
                            key={pl.id}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors duration-150"
                            onClick={() => {
                              addVideoToPlaylist.mutate({ playlistId: pl.id, videoId });
                              setShowPlaylistMenu(false);
                            }}
                          >
                            <ListPlus className="h-3.5 w-3.5" />
                            {pl.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {video.description && (
                <div className="rounded-2xl glass-card p-4">
                  <p className="whitespace-pre-wrap break-words text-sm">{video.description}</p>
                </div>
              )}

              {/* Comments */}
              <VideoComments videoId={videoId} />
            </div>

            {/* Sidebar: Recommendations */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Up Next</h3>
              {recommendations?.videos && recommendations.videos.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.videos.filter((v) => v.id !== videoId).slice(0, 8).map((rec) => (
                    <Link
                      key={rec.id}
                      to={`/watch/${rec.id}`}
                      className="flex gap-3 rounded-xl p-2 -m-2 transition-all duration-200 hover:bg-muted/50"
                    >
                      <div className="relative w-40 shrink-0 overflow-hidden rounded-lg bg-muted shadow-card">
                        {rec.thumbnail_url ? (
                          <OptimizedImage
                            src={rec.thumbnail_url}
                            alt=""
                            preset="thumbnail"
                            className="aspect-video w-full object-cover"
                          />
                        ) : (
                          <div className="aspect-video flex items-center justify-center bg-primary/10">
                            <Play className="h-6 w-6 text-primary/40" />
                          </div>
                        )}
                        {rec.duration && (
                          <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[10px] text-white">
                            {formatDurationShort(rec.duration)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="line-clamp-2 text-sm font-medium">{rec.title}</h4>
                        <p className="mt-1 text-xs text-muted-foreground">{rec.user?.full_name || rec.user?.username}</p>
                        <p className="text-xs text-muted-foreground">{formatViews(rec.views_count)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl glass-card p-6 text-center">
                  <p className="text-sm text-muted-foreground">No recommendations yet</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PlayCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}

function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function formatDurationShort(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
