import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInviteToEvent } from "../hooks";
import { useFriends } from "@/features/friends/hooks";
import { useAuthStore } from "@/store/authStore";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export function InviteModal({ isOpen, onClose, eventId }: InviteModalProps) {
  const { user } = useAuthStore();
  const { data: friendsData, isPending } = useFriends(user?.id);
  const inviteMutation = useInviteToEvent();
  const [selected, setSelected] = useState<string[]>([]);

  const friends = Array.isArray(friendsData) ? friendsData : [];

  const toggle = (userId: string) => {
    setSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleInvite = () => {
    if (selected.length === 0) return;
    inviteMutation.mutate(
      { id: eventId, userIds: selected },
      { onSuccess: () => { setSelected([]); onClose(); } }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-2xl bg-card p-5 shadow-xl max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Invite Friends</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {isPending ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !friends || friends.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No friends to invite
                </p>
              ) : (
                friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => toggle(friend.id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                      selected.includes(friend.id)
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted border border-transparent"
                    }`}
                  >
                    {friend.avatar_url ? (
                      <img
                        src={getCloudinaryTransformedUrl(friend.avatar_url, "avatar")}
                        alt=""
                        width={40}
                        height={40}
                        loading="lazy"
                        decoding="async"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                        {(friend.username || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{friend.full_name || friend.username}</p>
                      <p className="text-xs text-muted-foreground">@{friend.username}</p>
                    </div>
                    {selected.includes(friend.id) && (
                      <Check className="h-5 w-5 text-primary shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleInvite}
                disabled={selected.length === 0 || inviteMutation.isPending}
              >
                {inviteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-1.5" />
                )}
                Invite ({selected.length})
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
