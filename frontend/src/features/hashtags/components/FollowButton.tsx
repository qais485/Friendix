import { UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFollowHashtag, useUnfollowHashtag } from "../hooks";

interface FollowButtonProps {
  hashtagName: string;
  isFollowing: boolean;
  size?: "sm" | "md" | "lg";
}

export function FollowButton({ hashtagName, isFollowing, size = "md" }: FollowButtonProps) {
  const followMutation = useFollowHashtag();
  const unfollowMutation = useUnfollowHashtag();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFollowing) {
      unfollowMutation.mutate(hashtagName);
    } else {
      followMutation.mutate(hashtagName);
    }
  };

  const isPending = followMutation.isPending || unfollowMutation.isPending;

  if (isFollowing) {
    return (
      <Button
        variant="outline"
        size={size === "sm" ? "sm" : "default"}
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary",
          size === "sm" && "h-8 px-3 text-xs",
          size === "lg" && "h-11 px-6 text-sm"
        )}
      >
        <UserMinus className={cn("h-3.5 w-3.5", size === "lg" && "h-4 w-4")} />
        Following
      </Button>
    );
  }

  return (
    <Button
      size={size === "sm" ? "sm" : "default"}
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "gap-1.5",
        size === "sm" && "h-8 px-3 text-xs",
        size === "lg" && "h-11 px-6 text-sm"
      )}
    >
      <UserPlus className={cn("h-3.5 w-3.5", size === "lg" && "h-4 w-4")} />
      Follow
    </Button>
  );
}
