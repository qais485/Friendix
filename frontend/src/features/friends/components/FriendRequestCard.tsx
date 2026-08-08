import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import type { FriendDetail } from "@/types";

interface FriendRequestCardProps {
  user: FriendDetail;
  type: "sent" | "received";
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  isProcessing?: boolean;
}

export function FriendRequestCard({ user, type, onAccept, onReject, onCancel, isProcessing }: FriendRequestCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center justify-between rounded-2xl glass-card p-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-elevated"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar
            src={user.avatar_url}
            alt={user.full_name || "User"}
            fallback={user.full_name?.charAt(0) || "?"}
            size="md"
            showRing={false}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold">{user.full_name || "Unknown User"}</p>
            {user.is_verified && (
              <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">✓</span>
            )}
          </div>
          {user.username && <p className="truncate text-xs text-muted-foreground">@{user.username}</p>}
          {user.mutual_friends_count > 0 && (
            <p className="text-xs text-muted-foreground">
              {user.mutual_friends_count} mutual friend{user.mutual_friends_count !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        {type === "received" ? (
          <>
            <Button variant="outline" size="sm" className="rounded-xl transition-all duration-200 hover:shadow-card" onClick={onReject} disabled={isProcessing}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" className="rounded-xl transition-all duration-200 hover:shadow-card" onClick={onAccept} disabled={isProcessing}>
              <Check className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" className="rounded-xl transition-all duration-200 hover:shadow-card" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
}
