import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";
import type { BlockedUser, BlockType } from "@/types";

interface BlockMuteListProps {
  users: BlockedUser[];
  type: BlockType;
  isLoading: boolean;
  onRemove: (userId: string) => void;
  isRemoving?: boolean;
}

const TYPE_CONFIG = {
  block: { emptyMessage: "No blocked users", removeLabel: "Unblock" },
  mute: { emptyMessage: "No muted users", removeLabel: "Unmute" },
  restrict: { emptyMessage: "No restricted users", removeLabel: "Unrestrict" },
};

export function BlockMuteList({ users, type, isLoading, onRemove, isRemoving }: BlockMuteListProps) {
  const config = TYPE_CONFIG[type];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>{config.emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {users.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between gap-3 rounded-2xl glass-card p-3"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {user.avatar_url ? (
                <img
                  src={getCloudinaryTransformedUrl(user.avatar_url, "avatar")}
                  alt={user.full_name || "User"}
                  width={40}
                  height={40}
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {(user.full_name || user.username || "U")[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.full_name || "User"}</p>
                {user.username && <p className="truncate text-xs text-muted-foreground">@{user.username}</p>}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0 rounded-full" onClick={() => onRemove(user.id)} disabled={isRemoving}>
              {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : config.removeLabel}
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
