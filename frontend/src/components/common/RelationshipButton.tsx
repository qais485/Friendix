import { useState } from "react";
import {
  UserPlus,
  UserCheck,
  Clock,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import type { FriendshipStatus } from "@/types";

interface RelationshipButtonProps {
  status: FriendshipStatus | undefined;
  isLoading?: boolean;
  isFriendLoading?: boolean;
  isFollowLoading?: boolean;
  onAddFriend?: () => void;
  onCancelRequest?: () => void;
  onAcceptRequest?: () => void;
  onRejectRequest?: () => void;
  onRemoveFriend?: () => void;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onRequestFollow?: () => void;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function RelationshipButton({
  status,
  isLoading = false,
  isFriendLoading = false,
  isFollowLoading = false,
  onAddFriend,
  onCancelRequest,
  onAcceptRequest,
  onRejectRequest,
  onRemoveFriend,
  onFollow,
  onUnfollow,
  onRequestFollow,
  size = "default",
  className,
}: RelationshipButtonProps) {
  const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);

  if (isLoading) {
    return (
      <Button variant="outline" size={size} className={cn("rounded-full", className)} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!status) return null;

  const anyLoading = isFriendLoading || isFollowLoading;

  const renderFriendButton = () => {
    switch (status.status) {
      case null:
        return (
          <Button
            variant="default"
            size={size}
            className="rounded-full gap-1.5"
            onClick={onAddFriend}
            disabled={anyLoading}
          >
            {isFriendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Add Friend
          </Button>
        );
      case "pending":
        if (status.is_requester) {
          return (
            <Button
              variant="outline"
              size={size}
              className="rounded-full gap-1.5"
              onClick={onCancelRequest}
              disabled={anyLoading}
            >
              {isFriendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
              Cancel Request
            </Button>
          );
        }
        return (
          <div className={cn("flex items-center gap-1.5", className)}>
            <Button
              variant="default"
              size={size}
              className="rounded-full gap-1.5"
              onClick={onAcceptRequest}
              disabled={anyLoading}
            >
              {isFriendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Accept
            </Button>
            <Button
              variant="ghost"
              size={size}
              className="rounded-full"
              onClick={onRejectRequest}
              disabled={anyLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      case "accepted":
        return (
          <Button
            variant="secondary"
            size={size}
            className="rounded-full gap-1.5"
            onClick={() => setShowUnfriendConfirm(true)}
            disabled={anyLoading}
          >
            <UserCheck className="h-4 w-4" />
            Friends
          </Button>
        );
      default:
        return null;
    }
  };

  const renderFollowButton = () => {
    if (status.status === "pending") return null;

    if (status.is_following) {
      return (
        <Button
          variant="outline"
          size={size}
          className="rounded-full gap-1.5"
          onClick={() => setShowUnfollowConfirm(true)}
          disabled={anyLoading}
        >
          {isFollowLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
          Following
        </Button>
      );
    }

    return (
      <Button
        variant="default"
        size={size}
        className="rounded-full gap-1.5"
        onClick={onFollow || onRequestFollow}
        disabled={anyLoading}
      >
        {isFollowLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        Follow
      </Button>
    );
  };

  return (
    <>
      <div className={cn("flex items-center gap-2", className)}>
        {renderFriendButton()}
        {renderFollowButton()}
      </div>

      <ConfirmationDialog
        isOpen={showUnfriendConfirm}
        onClose={() => setShowUnfriendConfirm(false)}
        onConfirm={() => {
          onRemoveFriend?.();
          setShowUnfriendConfirm(false);
        }}
        title="Remove Friend?"
        description="This will remove them from your friends list. They won't be notified."
        confirmLabel="Remove"
        destructive
        loading={isFriendLoading}
      />

      <ConfirmationDialog
        isOpen={showUnfollowConfirm}
        onClose={() => setShowUnfollowConfirm(false)}
        onConfirm={() => {
          onUnfollow?.();
          setShowUnfollowConfirm(false);
        }}
        title="Unfollow?"
        description="You won't see their posts in your feed."
        confirmLabel="Unfollow"
        destructive
        loading={isFollowLoading}
      />
    </>
  );
}
