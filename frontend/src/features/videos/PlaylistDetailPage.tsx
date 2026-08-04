import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ListVideo, Loader2, Inbox, Globe, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCard } from "./components/VideoCard";
import { usePlaylistDetail } from "./hooks";

export function PlaylistDetailPage() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const { data: playlist, isPending, error } = usePlaylistDetail(playlistId);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !playlist) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="rounded-3xl glass-card p-10 text-center">
            <ListVideo className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">Playlist not found</p>
            <Link to="/videos/playlists">
              <Button variant="outline" className="mt-4 rounded-xl transition-all duration-200 hover:shadow-card">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Playlists
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="pt-12 md:pt-0">
            <Link
              to="/videos/playlists"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Playlists
            </Link>
          </div>

          <div className="rounded-2xl glass-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-card">
                <ListVideo className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{playlist.name}</h1>
                <div className="mt-1.5 flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{playlist.videos_count} videos</span>
                  <span className="flex items-center gap-1">
                    {playlist.privacy === "only_me" ? (
                      <><Lock className="h-3 w-3" /> Private</>
                    ) : playlist.privacy === "friends" ? (
                      <><Users className="h-3 w-3" /> Friends</>
                    ) : (
                      <><Globe className="h-3 w-3" /> Public</>
                    )}
                  </span>
                </div>
                {playlist.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{playlist.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Videos */}
          {playlist.videos.length === 0 ? (
            <div className="rounded-3xl glass-card p-10 text-center">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">No videos in this playlist</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {playlist.videos.map((video, i) => (
                <VideoCard key={video.id} video={video} index={i} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
