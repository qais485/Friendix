import { useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Pin, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroupAnnouncements, useCreateAnnouncement } from "../hooks";
import { formatDistanceToNow } from "@/lib/utils";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";
import type { Group } from "@/types";

interface GroupAnnouncementsProps {
  group: Group;
}

export function GroupAnnouncements({ group }: GroupAnnouncementsProps) {
  const { data: announcements, isPending } = useGroupAnnouncements(group.slug);
  const createMutation = useCreateAnnouncement();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const canPost = group.member_role === "admin" || group.member_role === "moderator";

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) return;
    createMutation.mutate(
      { slug: group.slug, title: title.trim(), content: content.trim() },
      { onSuccess: () => { setTitle(""); setContent(""); setShowForm(false); } }
    );
  };

  if (isPending) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {canPost && (
        <>
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "New Announcement"}
          </Button>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-2xl glass-card p-4 space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your announcement..."
                rows={3}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <Button size="sm" onClick={handleCreate} disabled={!title.trim() || !content.trim() || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Megaphone className="h-4 w-4 mr-1" />}
                Post
              </Button>
            </motion.div>
          )}
        </>
      )}

      {!announcements || announcements.length === 0 ? (
        <div className="rounded-3xl glass-card p-8 text-center">
          <Megaphone className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No announcements yet</p>
        </div>
      ) : (
        announcements.map((ann, i) => (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-2xl glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              {ann.avatar_url ? (
                <img
                  src={getCloudinaryTransformedUrl(ann.avatar_url, "avatar")}
                  alt=""
                  width={24}
                  height={24}
                  loading="lazy"
                  decoding="async"
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                  {(ann.username || "U")[0].toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium">{ann.username}</span>
              {ann.is_pinned && <Pin className="h-3 w-3 text-primary" />}
              <span className="ml-auto text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(ann.created_at))}
              </span>
            </div>
            <h4 className="font-semibold text-sm">{ann.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{ann.content}</p>
          </motion.div>
        ))
      )}
    </div>
  );
}
