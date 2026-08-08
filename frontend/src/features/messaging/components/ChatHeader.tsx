import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Video,
  MoreVertical,
  Pin,
  Archive,
  BellOff,
  Bell,
  Trash2,
  Users,
  Palette,
  UserPlus,
  UserCheck,
  Ban,
  ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useMessagingStore } from "@/store/messagingStore";
import { useTogglePin, useToggleArchive, useToggleMute, useDeleteConversation } from "../hooks";
import { useRelationshipSummary, useSendFriendRequest, useFollow, useBlockUser } from "@/features/friends/hooks";
import { useToast } from "@/hooks/useToast";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { CallModal } from "./CallModal";
import { ChatThemeSelector } from "./ChatThemeSelector";
import type { Conversation } from "@/types";

interface ChatHeaderProps {
  conversation: Conversation;
  onBack?: () => void;
}

export function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
  const { user } = useAuthStore();
  const { onlineUsers } = useMessagingStore();
  const togglePin = useTogglePin();
  const toggleArchive = useToggleArchive();
  const toggleMute = useToggleMute();
  const deleteConversation = useDeleteConversation();
  const [showMenu, setShowMenu] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [callModal, setCallModal] = useState<{ isOpen: boolean; type: "audio" | "video" }>({
    isOpen: false,
    type: "audio",
  });
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const { toast } = useToast();

  const otherMember = conversation.members.find((m) => m.user_id !== user?.id);
  const displayName = conversation.is_group
    ? conversation.title || "Group Chat"
    : otherMember?.full_name || otherMember?.username || "Unknown";
  const avatarUrl = conversation.is_group
    ? conversation.group_photo_url
    : otherMember?.avatar_url;
  const isOnline = !conversation.is_group && otherMember
    ? onlineUsers[otherMember.user_id] ?? otherMember.is_online
    : false;

  const isMuted = conversation.members.find((m) => m.user_id === user?.id)?.is_muted || false;

  const otherUserId = otherMember?.user_id;
  const { data: relationship } = useRelationshipSummary(
    user?.id,
    user?.id && otherUserId && !conversation.is_group ? otherUserId : undefined
  );
  const sendFriendRequest = useSendFriendRequest(user?.id || "");
  const followUser = useFollow(user?.id || "");
  const blockUser = useBlockUser(user?.id || "");

  const handlePin = () => {
    togglePin.mutate({ conversationId: conversation.id, isPinned: !conversation.is_pinned });
    setShowMenu(false);
  };

  const handleArchive = () => {
    toggleArchive.mutate({ conversationId: conversation.id, isArchived: !conversation.is_archived });
    setShowMenu(false);
  };

  const handleMute = () => {
    toggleMute.mutate({ conversationId: conversation.id, isMuted: !isMuted });
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to leave this conversation?")) {
      deleteConversation.mutate(conversation.id);
    }
    setShowMenu(false);
  };

  return (
    <div className="flex items-center gap-2 border-b px-3 py-3 sm:gap-3 sm:px-4">
      {onBack && (
        <button
          onClick={onBack}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div className="relative flex-shrink-0">
        {avatarUrl ? (
          <OptimizedImage
            src={avatarUrl}
            alt={displayName}
            preset="avatar"
            eager
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
            {displayName[0].toUpperCase()}
          </div>
        )}
        {isOnline && (
          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{displayName}</p>
        <p className="text-xs text-muted-foreground">
          {conversation.is_group
            ? `${conversation.members.length} members`
            : isOnline
            ? "Online"
            : otherMember?.last_seen_at
            ? `Last seen ${formatLastSeen(otherMember.last_seen_at)}`
            : "Offline"}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setCallModal({ isOpen: true, type: "audio" })}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
        >
          <Phone className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCallModal({ isOpen: true, type: "video" })}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
        >
          <Video className="h-5 w-5" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-full z-50 mt-1 w-56 max-w-[calc(100vw-2rem)] rounded-2xl glass-card"
              >
                {!conversation.is_group && otherUserId && (
                  <>
                    <button
                      onClick={() => { window.location.href = `/profile/${otherMember?.username}`; setShowMenu(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted rounded-t-xl"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Profile
                    </button>
                    {relationship && !relationship.are_friends && !relationship.are_blocked && (
                      <button
                        onClick={() => { sendFriendRequest.mutate(otherUserId, { onSuccess: () => toast({ title: "Friend request sent" }) }); setShowMenu(false); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted"
                        disabled={sendFriendRequest.isPending}
                      >
                        <UserPlus className="h-4 w-4" />
                        Add Friend
                      </button>
                    )}
                    {relationship && !relationship.is_following && !relationship.are_friends && !relationship.are_blocked && (
                      <button
                        onClick={() => { followUser.mutate(otherUserId, { onSuccess: () => toast({ title: "Following" }) }); setShowMenu(false); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted"
                        disabled={followUser.isPending}
                      >
                        <UserCheck className="h-4 w-4" />
                        Follow
                      </button>
                    )}
                    <div className="my-1 h-px bg-border" />
                  </>
                )}
                <button
                  onClick={handlePin}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  <Pin className="h-4 w-4" />
                  {conversation.is_pinned ? "Unpin" : "Pin"}
                </button>
                <button
                  onClick={handleArchive}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  <Archive className="h-4 w-4" />
                  {conversation.is_archived ? "Unarchive" : "Archive"}
                </button>
                <button
                  onClick={handleMute}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  {isMuted ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  {isMuted ? "Unmute" : "Mute"}
                </button>
                <button
                  onClick={() => {
                    setShowThemeSelector(true);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  <Palette className="h-4 w-4" />
                  Chat Theme
                </button>
                {conversation.is_group && (
                  <button className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted">
                    <Users className="h-4 w-4" />
                    Members
                  </button>
                )}
                {!conversation.is_group && relationship && !relationship.are_blocked && (
                  <>
                    <div className="my-1 h-px bg-border" />
                    <button
                      onClick={() => { setShowBlockConfirm(true); setShowMenu(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Ban className="h-4 w-4" />
                      Block
                    </button>
                  </>
                )}
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-destructive transition-colors hover:bg-destructive/10 rounded-b-xl"
                >
                  <Trash2 className="h-4 w-4" />
                  Leave Chat
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <CallModal
        isOpen={callModal.isOpen}
        onClose={() => setCallModal({ isOpen: false, type: "audio" })}
        conversationId={conversation.id}
        recipientName={displayName}
        recipientAvatar={avatarUrl}
        callType={callModal.type}
      />

      {showThemeSelector && (
        <ChatThemeSelector
          conversationId={conversation.id}
          currentTheme={conversation.chat_theme}
          onClose={() => setShowThemeSelector(false)}
        />
      )}

      <ConfirmationDialog
        isOpen={showBlockConfirm}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={() => {
          if (otherUserId) {
            blockUser.mutate(otherUserId, { onSuccess: () => { toast({ title: "User blocked" }); setShowBlockConfirm(false); } });
          }
        }}
        title={`Block ${displayName}?`}
        description="They won't be able to find your profile, posts, or stories. They won't know they've been blocked."
        confirmLabel="Block"
        destructive
        loading={blockUser.isPending}
      />
    </div>
  );
}

function formatLastSeen(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  return date.toLocaleDateString();
}
