import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreHorizontal,
  UserPlus,
  UserMinus,
  UserCheck,
  Ban,
  VolumeX,
  Shield,
  Flag,
  Star,
  StarOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import {
  useSendFriendRequest,
  useCancelFriendRequest,
  useRemoveFriend,
  useFollow,
  useUnfollow,
  useBlockUser,
  useUnblockUser,
  useMuteUser,
  useUnmuteUser,
  useRestrictUser,
  useUnrestrictUser,
  useAddCloseFriend,
  useRemoveCloseFriend,
  useRelationshipSummary,
} from "@/features/friends/hooks";

interface UserActionMenuProps {
  currentUserId: string;
  targetUserId: string;
  targetUsername?: string;
  targetFullName?: string;
  triggerClassName?: string;
  compact?: boolean;
  onProfileClick?: () => void;
}

export function UserActionMenu({
  currentUserId,
  targetUserId,
  targetUsername,
  targetFullName,
  triggerClassName,
  compact = false,
  onProfileClick,
}: UserActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: summary } = useRelationshipSummary(currentUserId, targetUserId);
  const sendFriendRequest = useSendFriendRequest(currentUserId);
  const cancelFriendRequest = useCancelFriendRequest(currentUserId);
  const removeFriend = useRemoveFriend(currentUserId);
  const follow = useFollow(currentUserId);
  const unfollow = useUnfollow(currentUserId);
  const blockUser = useBlockUser(currentUserId);
  const unblockUser = useUnblockUser(currentUserId);
  const muteUser = useMuteUser(currentUserId);
  const unmuteUser = useUnmuteUser(currentUserId);
  const restrictUser = useRestrictUser(currentUserId);
  const unrestrictUser = useUnrestrictUser(currentUserId);
  const addCloseFriend = useAddCloseFriend(currentUserId);
  const removeCloseFriend = useRemoveCloseFriend(currentUserId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!summary || currentUserId === targetUserId) return null;

  const anyLoading = sendFriendRequest.isPending || cancelFriendRequest.isPending ||
    removeFriend.isPending || follow.isPending || unfollow.isPending ||
    blockUser.isPending || unblockUser.isPending || muteUser.isPending ||
    unmuteUser.isPending || restrictUser.isPending || unrestrictUser.isPending ||
    addCloseFriend.isPending || removeCloseFriend.isPending;

  const MenuItem = ({
    onClick,
    icon: Icon,
    label,
    danger = false,
    loading = false,
  }: {
    onClick: () => void;
    icon: typeof Ban;
    label: string;
    danger?: boolean;
    loading?: boolean;
  }) => (
    <button
      role="menuitem"
      onClick={() => {
        if (!loading) {
          onClick();
          setIsOpen(false);
        }
      }}
      disabled={loading || anyLoading}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        danger
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-muted",
        (loading || anyLoading) && "opacity-50 cursor-not-allowed"
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      {label}
    </button>
  );

  return (
    <>
      <div className="relative" ref={menuRef}>
        <Button
          variant="ghost"
          size={compact ? "icon-sm" : "icon"}
          className={cn("rounded-full", triggerClassName)}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="More actions"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              role="menu"
              aria-label="User actions"
              className="absolute right-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-2xl glass-card p-1.5 shadow-float"
            >
              <MenuItem
                onClick={() => {
                  if (onProfileClick) onProfileClick();
                  else window.location.href = `/profile/${targetUsername}`;
                }}
                icon={UserPlus}
                label="View Profile"
              />

              {!summary.are_friends && !summary.are_blocked && (
                <MenuItem
                  onClick={() => sendFriendRequest.mutate(targetUserId)}
                  icon={UserPlus}
                  label="Add Friend"
                  loading={sendFriendRequest.isPending}
                />
              )}

              {summary.are_friends && (
                <MenuItem
                  onClick={() => setShowRemoveConfirm(true)}
                  icon={UserMinus}
                  label="Remove Friend"
                  danger
                  loading={removeFriend.isPending}
                />
              )}

              {summary.are_friends && summary.is_close_friend && (
                <MenuItem
                  onClick={() => removeCloseFriend.mutate(targetUserId)}
                  icon={StarOff}
                  label="Remove from Close Friends"
                  loading={removeCloseFriend.isPending}
                />
              )}

              {summary.are_friends && !summary.is_close_friend && (
                <MenuItem
                  onClick={() => addCloseFriend.mutate(targetUserId)}
                  icon={Star}
                  label="Add to Close Friends"
                  loading={addCloseFriend.isPending}
                />
              )}

              {!summary.is_following && !summary.are_blocked && (
                <MenuItem
                  onClick={() => follow.mutate(targetUserId)}
                  icon={UserCheck}
                  label="Follow"
                  loading={follow.isPending}
                />
              )}

              {summary.is_following && (
                <MenuItem
                  onClick={() => unfollow.mutate(targetUserId)}
                  icon={UserMinus}
                  label="Unfollow"
                  loading={unfollow.isPending}
                />
              )}

              <div className="my-1 h-px bg-border" />

              {summary.are_blocked ? (
                <MenuItem
                  onClick={() => unblockUser.mutate(targetUserId)}
                  icon={Ban}
                  label="Unblock"
                  loading={unblockUser.isPending}
                />
              ) : (
                <MenuItem
                  onClick={() => setShowBlockConfirm(true)}
                  icon={Ban}
                  label="Block"
                  danger
                  loading={blockUser.isPending}
                />
              )}

              {summary.is_muted ? (
                <MenuItem
                  onClick={() => unmuteUser.mutate(targetUserId)}
                  icon={VolumeX}
                  label="Unmute"
                  loading={unmuteUser.isPending}
                />
              ) : (
                <MenuItem
                  onClick={() => muteUser.mutate({ mutedUserId: targetUserId })}
                  icon={VolumeX}
                  label="Mute"
                  loading={muteUser.isPending}
                />
              )}

              {summary.is_restricted ? (
                <MenuItem
                  onClick={() => unrestrictUser.mutate(targetUserId)}
                  icon={Shield}
                  label="Unrestrict"
                  loading={unrestrictUser.isPending}
                />
              ) : (
                <MenuItem
                  onClick={() => restrictUser.mutate(targetUserId)}
                  icon={Shield}
                  label="Restrict"
                  loading={restrictUser.isPending}
                />
              )}

              <div className="my-1 h-px bg-border" />

              <MenuItem
                onClick={() => setShowReportConfirm(true)}
                icon={Flag}
                label="Report"
                danger
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmationDialog
        isOpen={showBlockConfirm}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={() => {
          blockUser.mutate(targetUserId);
          setShowBlockConfirm(false);
        }}
        title={`Block ${targetFullName || targetUsername}?`}
        description="They won't be able to find your profile, posts, or stories. They won't know they've been blocked."
        confirmLabel="Block"
        destructive
        loading={blockUser.isPending}
      />

      <ConfirmationDialog
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={() => {
          removeFriend.mutate(targetUserId);
          setShowRemoveConfirm(false);
        }}
        title={`Remove ${targetFullName || targetUsername} as friend?`}
        description="This will remove them from your friends list. They won't be notified."
        confirmLabel="Remove"
        destructive
        loading={removeFriend.isPending}
      />

      <ConfirmationDialog
        isOpen={showReportConfirm}
        onClose={() => setShowReportConfirm(false)}
        onConfirm={() => {
          setShowReportConfirm(false);
        }}
        title="Report this user?"
        description="Your report will be reviewed by our team. Thank you for helping keep our community safe."
        confirmLabel="Report"
        destructive
      />
    </>
  );
}
