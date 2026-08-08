import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Loader2, Radio, Users, Play, Calendar, ArrowLeft } from "lucide-react";
import { useLiveStream, useGoLive, useEndStream, useStartRecording, useStopRecording, useActiveStreams, useCreateLiveStream } from "./hooks";
import { LiveChat } from "./components/LiveChat";
import { LiveReactions } from "./components/LiveReactions";
import { LiveDonations } from "./components/LiveDonations";
import { LiveStreamPlayer } from "./components/LiveStreamPlayer";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";
import { Avatar } from "@/components/ui/avatar";

export function LivePage() {
  const { streamId } = useParams<{ streamId: string }>();

  if (streamId) {
    return <LiveStreamView streamId={streamId} />;
  }

    return <LiveDiscoveryView />;
}

function LiveDiscoveryView() {
  const { data: activeStreamsPages, isLoading } = useActiveStreams();
  const activeStreams = activeStreamsPages?.pages?.flatMap((page) => page.streams) ?? [];
  const [showCreateStream, setShowCreateStream] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamDescription, setStreamDescription] = useState("");
  const [streamPrivacy, setStreamPrivacy] = useState<"everyone" | "friends" | "only_me">("everyone");
  const createStream = useCreateLiveStream();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 shadow-card transition-all duration-200">
            <Radio className="h-6 w-6 text-red-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Live Streams</h1>
            <p className="text-sm text-muted-foreground">Discover what's happening now</p>
          </div>
          <div className="ml-auto">
            <Button onClick={() => setShowCreateStream(true)} className="rounded-xl transition-all duration-200 hover:shadow-elevated">
              <Radio className="mr-2 h-4 w-4" />
              Go Live
            </Button>
          </div>
        </div>

        {activeStreams.length === 0 ? (
          <div className="rounded-2xl glass-card p-12 text-center transition-all duration-200">
            <Radio className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <h2 className="mt-6 text-xl font-bold">No live streams right now</h2>
            <p className="mt-2 text-muted-foreground">
              Check back later or start your own stream!
            </p>
            <Link to="/live/schedule">
              <Button className="mt-6 rounded-xl transition-all duration-200 hover:shadow-elevated">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule a Stream
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeStreams.map((stream) => (
              <Link
                key={stream.id}
                to={`/live/${stream.id}`}
                className="group overflow-hidden rounded-2xl glass-card transition-all duration-200 hover:shadow-elevated"
              >
                <div className="relative aspect-video bg-muted">
                  {stream.thumbnail_url ? (
                    <img
                      src={getCloudinaryTransformedUrl(stream.thumbnail_url, "thumbnail")}
                      alt={stream.title}
                      width={320}
                      height={180}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-500/20 to-purple-500/20">
                      <Play className="h-12 w-12 text-red-500 opacity-60" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-float" aria-label="Live stream">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />
                      LIVE
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm shadow-float">
                    <Users className="h-3 w-3" />
                    {stream.viewers_count}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={stream.user?.avatar_url}
                      alt=""
                      fallback={(stream.user?.username || "U")[0].toUpperCase()}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold group-hover:text-primary transition-all duration-200">
                        {stream.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {stream.user?.display_name || stream.user?.username || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showCreateStream && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-stream-title"
            className="w-full max-w-md rounded-2xl glass-card p-6 shadow-float transition-all duration-200 max-h-[90vh] overflow-y-auto"
          >
            <h2 id="create-stream-title" className="text-xl font-bold">Create Live Stream</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="stream-title" className="text-sm font-medium">Title</label>
                <input
                  id="stream-title"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-muted/80 px-3 py-2.5 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:shadow-elevated"
                  placeholder="Stream title"
                />
              </div>
              <div>
                <label htmlFor="stream-description" className="text-sm font-medium">Description</label>
                <textarea
                  id="stream-description"
                  value={streamDescription}
                  onChange={(e) => setStreamDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-muted/80 px-3 py-2.5 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:shadow-elevated"
                  placeholder="What's your stream about?"
                  rows={3}
                />
              </div>
              <div>
                <label htmlFor="stream-privacy" className="text-sm font-medium">Who can watch?</label>
                <select
                  id="stream-privacy"
                  value={streamPrivacy}
                  onChange={(e) => setStreamPrivacy(e.target.value as typeof streamPrivacy)}
                  className="mt-1 w-full rounded-xl bg-muted/80 px-3 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:shadow-elevated"
                >
                  <option value="everyone">Everyone</option>
                  <option value="friends">Friends Only</option>
                  <option value="only_me">Only Me (Private)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowCreateStream(false)} className="rounded-xl transition-all duration-200 hover:bg-muted">Cancel</Button>
                <Button
                  onClick={async () => {
                    if (!streamTitle.trim()) return;
                    try {
                      const result = await createStream.mutateAsync({
                        title: streamTitle,
                        description: streamDescription,
                        privacy: streamPrivacy,
                      });
                      setShowCreateStream(false);
                      navigate(`/live/${result.id}`);
                    } catch {
                      toast({ title: "Failed to create stream", description: "Please try again.", variant: "destructive" });
                    }
                  }}
                  disabled={!streamTitle.trim() || createStream.isPending}
                  className="rounded-xl transition-all duration-200 hover:shadow-elevated"
                >
                  {createStream.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Radio className="mr-2 h-4 w-4" />}
                  Start Stream
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveStreamView({ streamId }: { streamId: string }) {
  const { toast } = useToast();
  const { data: stream, isLoading, error } = useLiveStream(streamId);
  const goLive = useGoLive();
  const endStream = useEndStream();
  const startRecording = useStartRecording();
  const stopRecording = useStopRecording();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold">Stream not found</h2>
          <p className="mt-2 text-muted-foreground">The stream you're looking for doesn't exist or has been removed.</p>
          <Link to="/live">
            <Button variant="outline" className="mt-4 rounded-xl transition-all duration-200 hover:shadow-elevated">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Live
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isHost = stream.is_host ?? false;
  const isModerator = stream.is_moderator ?? false;

  const handleGoLive = async () => {
    try { await goLive.mutateAsync(stream.id); toast({ title: "Success", description: "You're now live!" }); }
    catch { toast({ title: "Error", description: "Failed to start live stream", variant: "destructive" }); }
  };

  const handleEndStream = async () => {
    try { await endStream.mutateAsync(stream.id); toast({ title: "Success", description: "Stream ended" }); }
    catch { toast({ title: "Error", description: "Failed to end stream", variant: "destructive" }); }
  };

  const handleStartRecording = async () => {
    try { await startRecording.mutateAsync(stream.id); toast({ title: "Success", description: "Recording started" }); }
    catch { toast({ title: "Error", description: "Failed to start recording", variant: "destructive" }); }
  };

  const handleStopRecording = async () => {
    try { await stopRecording.mutateAsync(stream.id); toast({ title: "Success", description: "Recording stopped" }); }
    catch { toast({ title: "Error", description: "Failed to stop recording", variant: "destructive" }); }
  };

  return (
    <div className="min-h-screen bg-background bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <LiveStreamPlayer stream={stream} isHost={isHost} />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="break-words text-xl font-bold tracking-tight">{stream.title}</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {stream.user?.display_name || stream.user?.username || "Unknown"} · {stream.viewers_count} viewers
                </p>
              </div>

              {isHost && (
                <div className="flex flex-wrap gap-2">
                  {stream.status === "scheduled" && (
                    <Button size="sm" className="rounded-xl bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-card hover:shadow-elevated" onClick={handleGoLive} disabled={goLive.isPending} aria-label="Start live stream">
                      {goLive.isPending ? "Starting..." : "Go Live"}
                    </Button>
                  )}
                  {stream.status === "live" && (
                    <>
                      <Button size="sm" variant="outline" className="rounded-xl transition-all duration-200 hover:shadow-elevated" onClick={handleStartRecording} disabled={startRecording.isPending || stream.is_recording} aria-label="Start recording">
                        {startRecording.isPending ? "Starting..." : "Record"}
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-xl transition-all duration-200 hover:shadow-elevated" onClick={handleStopRecording} disabled={stopRecording.isPending || !stream.is_recording} aria-label="Stop recording">
                        {stopRecording.isPending ? "Stopping..." : "Stop Record"}
                      </Button>
                      <Button size="sm" className="rounded-xl bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-card hover:shadow-elevated" onClick={handleEndStream} disabled={endStream.isPending} aria-label="End live stream">
                        {endStream.isPending ? "Ending..." : "End Stream"}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {stream.description && (
              <div className="rounded-2xl bg-muted/50 p-4 transition-all duration-200">
                <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{stream.description}</p>
              </div>
            )}

            <LiveReactions streamId={stream.id} allowReactions={stream.allow_reactions} />
          </div>

          <div className="space-y-5">
            <LiveChat streamId={stream.id} isHost={isHost} isModerator={isModerator} allowChat={stream.allow_chat} />
            <LiveDonations streamId={stream.id} allowDonations={stream.allow_donations} />
          </div>
        </div>
      </div>
    </div>
  );
}
