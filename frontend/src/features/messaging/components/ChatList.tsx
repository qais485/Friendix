import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Pin,
  Users,
  MessageSquarePlus,
} from "lucide-react";
import { useConversations, useCreateConversation } from "../hooks";
import { useFriends } from "@/features/friends/hooks";
import { useAuthStore } from "@/store/authStore";
import { useMessagingStore } from "@/store/messagingStore";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Conversation, FriendDetail } from "@/types";

interface ChatListProps {
  onSelectConversation: (id: string) => void;
  selectedConversationId?: string | null;
}

export function ChatList({ onSelectConversation, selectedConversationId }: ChatListProps) {
  const { user } = useAuthStore();
  const { onlineUsers } = useMessagingStore();
  const { data: conversations = [], isLoading } = useConversations();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const otherMember = conv.members.find((m) => m.user_id !== user?.id);
    return (
      conv.title?.toLowerCase().includes(query) ||
      otherMember?.full_name?.toLowerCase().includes(query) ||
      otherMember?.username?.toLowerCase().includes(query)
    );
  });

  const pinned = filteredConversations.filter((c) => c.is_pinned);
  const unpinned = filteredConversations.filter((c) => !c.is_pinned);

  return (
    <div className="flex h-full flex-col border-r bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex items-center justify-between border-b px-4 py-4">
        <h2 className="text-lg font-bold">Messages</h2>
        <button
          onClick={() => setShowNewChat(true)}
          className="rounded-xl p-2 text-muted-foreground hover:bg-muted transition-colors"
        >
          <MessageSquarePlus className="h-5 w-5" />
        </button>
      </div>

      <div className="px-3 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-muted/80 py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:bg-muted transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-3">
                <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  <div className="mt-1 h-3 w-36 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground font-medium">
              {searchQuery ? "No conversations found" : "No messages yet"}
            </p>
            <button
              onClick={() => setShowNewChat(true)}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              Start a conversation
            </button>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-4 py-2">
                  <Pin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-bold uppercase text-muted-foreground">
                    Pinned
                  </span>
                </div>
                {pinned.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    currentUserId={user?.id || ""}
                    isSelected={conv.id === selectedConversationId}
                    onlineUsers={onlineUsers}
                    onClick={() => onSelectConversation(conv.id)}
                  />
                ))}
              </div>
            )}
            {unpinned.length > 0 && (
              <div>
                {pinned.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground">
                      Recent
                    </span>
                  </div>
                )}
                {unpinned.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    currentUserId={user?.id || ""}
                    isSelected={conv.id === selectedConversationId}
                    onlineUsers={onlineUsers}
                    onClick={() => onSelectConversation(conv.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showNewChat && (
          <NewChatModal
            onClose={() => setShowNewChat(false)}
            onSelect={(id) => {
              onSelectConversation(id);
              setShowNewChat(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ConversationItem({
  conversation,
  currentUserId,
  isSelected,
  onlineUsers,
  onClick,
}: {
  conversation: Conversation;
  currentUserId: string;
  isSelected: boolean;
  onlineUsers: Record<string, boolean>;
  onClick: () => void;
}) {
  const otherMember = conversation.members.find((m) => m.user_id !== currentUserId);
  const displayName = conversation.is_group
    ? conversation.title || "Group Chat"
    : otherMember?.full_name || otherMember?.username || "Unknown";
  const avatarUrl = conversation.is_group
    ? conversation.group_photo_url
    : otherMember?.avatar_url;
  const isOnline = !conversation.is_group && otherMember
    ? onlineUsers[otherMember.user_id] ?? otherMember.is_online
    : false;

  return (
    <motion.button
      layout
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 rounded-xl mx-2",
        isSelected && "bg-primary/10"
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar
          src={avatarUrl}
          alt={displayName}
          fallback={displayName[0].toUpperCase()}
          size="md"
        />
        {isOnline && (
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-success" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className={cn("truncate text-sm", conversation.unread_count > 0 ? "font-bold" : "font-medium")}>{displayName}</p>
          {conversation.last_message_at && (
            <span className="flex-shrink-0 text-xs text-muted-foreground">
              {formatTime(conversation.last_message_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className={cn("truncate text-sm", conversation.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground")}>
            {conversation.last_message_content || "No messages yet"}
          </p>
          {conversation.unread_count > 0 && (
            <span className="ml-2 flex-shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function NewChatModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const userId = useAuthStore.getState().user?.id || "";
  const { data: friends = [] } = useFriends(userId);
  const createConversation = useCreateConversation();
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md rounded-3xl glass-card shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h3 className="text-lg font-bold">New Message</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted transition-colors"
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
              className="w-full rounded-xl bg-muted py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="max-h-60 overflow-y-auto scrollbar-thin">
            {filteredFriends.map((friend: FriendDetail) => (
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
                  "flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-muted/50",
                  selectedUsers.includes(friend.id) && "bg-primary/10"
                )}
              >
                <Avatar
                  src={friend.avatar_url}
                  alt={friend.full_name ?? undefined}
                  fallback={(friend.full_name || "U")[0].toUpperCase()}
                  size="md"
                />
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
            ))}
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

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}
