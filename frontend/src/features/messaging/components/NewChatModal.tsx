import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useCreateConversation } from "../hooks";
import { useFriends } from "@/features/friends/hooks";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import type { FriendDetail } from "@/types";

interface NewChatModalProps {
  onClose: () => void;
  onSelect: (id: string) => void;
}

export function NewChatModal({ onClose, onSelect }: NewChatModalProps) {
  const { user } = useAuthStore();
  const createConversation = useCreateConversation();
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { data: friends = [], isLoading } = useFriends(user?.id || "");

  const filteredFriends = friends.filter(
    (f: FriendDetail) =>
      (f.full_name && f.full_name.toLowerCase().includes(search.toLowerCase())) ||
      (f.username && f.username.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;
    const data = await createConversation.mutateAsync({
      participant_ids: selectedUsers,
      is_group: selectedUsers.length > 1,
    });
    onSelect(data.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md rounded-3xl glass-card shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-bold">New Message</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            &times;
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search friends..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full bg-muted py-2 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                      <div className="mt-1 h-3 w-16 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredFriends.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {search ? "No friends found" : "No friends to message"}
              </p>
            ) : (
              filteredFriends.map((friend: FriendDetail) => (
                <button
                  key={friend.id}
                  onClick={() =>
                    setSelectedUsers((prev) =>
                      prev.includes(friend.id)
                        ? prev.filter((id) => id !== friend.id)
                        : [...prev, friend.id]
                    )
                  }
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/50",
                    selectedUsers.includes(friend.id) && "bg-primary/10"
                  )}
                >
                  {friend.avatar_url ? (
                    <img
                      src={friend.avatar_url}
                      alt={friend.full_name ?? undefined}
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      {(friend.full_name || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{friend.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">@{friend.username}</p>
                  </div>
                  {selectedUsers.includes(friend.id) && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          <button
            onClick={handleCreate}
            disabled={selectedUsers.length === 0 || createConversation.isPending}
            className="mt-4 w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {createConversation.isPending ? "Creating..." : "Start Chat"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
