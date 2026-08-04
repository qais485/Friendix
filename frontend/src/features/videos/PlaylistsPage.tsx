import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ListVideo, Plus, Loader2, Inbox, Trash2, Lock, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserPlaylists, useCreatePlaylist, useDeletePlaylist } from "./hooks";
import { useAuthStore } from "@/store/authStore";
import type { Playlist } from "@/types/videos";

export function PlaylistsPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useUserPlaylists();
  const createPlaylist = useCreatePlaylist();
  const deletePlaylist = useDeletePlaylist();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [privacy, setPrivacy] = useState<"everyone" | "friends" | "only_me">("everyone");

  const handleCreate = () => {
    if (!name.trim()) return;
    createPlaylist.mutate(
      { name: name.trim(), privacy },
      { onSuccess: () => { setShowCreate(false); setName(""); } }
    );
  };

  const playlists = data?.playlists || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between pt-12 md:pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 shadow-card">
                <ListVideo className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">My Playlists</h1>
                <p className="text-sm text-muted-foreground">Organize your favorite videos</p>
              </div>
            </div>
            <Button onClick={() => setShowCreate(!showCreate)} className="gap-1.5 rounded-xl transition-all duration-200 hover:shadow-card">
              <Plus className="h-4 w-4" />
              New Playlist
            </Button>
          </div>

          {/* Create form */}
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-2xl glass-card p-5 space-y-3"
            >
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Playlist name..."
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                autoFocus
              />
              <div className="flex items-center gap-3">
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as typeof privacy)}
                  className="rounded-full border border-border/60 bg-card/60 backdrop-blur-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                >
                  <option value="everyone">Public</option>
                  <option value="friends">Friends</option>
                  <option value="only_me">Private</option>
                </select>
                <div className="flex-1" />
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button size="sm" className="rounded-xl" onClick={handleCreate} disabled={!name.trim() || createPlaylist.isPending}>
                  {createPlaylist.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Playlists grid */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : playlists.length === 0 ? (
            <div className="rounded-3xl glass-card p-10 text-center">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">No playlists yet</p>
              <Button className="mt-4 gap-1.5 rounded-xl transition-all duration-200 hover:shadow-card" onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4" />
                Create Playlist
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((pl: Playlist, i: number) => (
                <motion.div
                  key={pl.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/videos/playlists/${pl.id}`}
                    className="block rounded-2xl glass-card p-5 transition-all duration-200 hover:shadow-card hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-card">
                        <ListVideo className="h-6 w-6 text-primary" />
                      </div>
                      {pl.privacy === "only_me" ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : pl.privacy === "friends" ? (
                        <Users className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="mt-3 font-bold">{pl.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {pl.videos_count} {pl.videos_count === 1 ? "video" : "videos"}
                    </p>
                  </Link>
                  {pl.user_id === user?.id && (
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive transition-colors duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          if (window.confirm("Delete this playlist?")) {
                            deletePlaylist.mutate(pl.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
