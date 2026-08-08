import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, UserPlus, UserCheck, AtSign, Share2, Radio, Cake, Bell, X, Check, Loader2 } from "lucide-react";
import { useMarkAsRead, useDeleteNotification } from "../hooks";
import { useAcceptFriendRequest, useRejectFriendRequest } from "@/features/friends/hooks";
import { useAuthStore } from "@/store/authStore";
import type { Notification } from "@/types";
import { formatDistanceToNow } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface NotificationItemProps {
  notification: Notification;
  onDismiss: () => void;
}

const NOTIFICATION_ICONS: Record<string, typeof Heart> = {
  like: Heart,
  comment: MessageCircle,
  friend_request: UserPlus,
  friend_accept: UserCheck,
  follow: UserPlus,
  mention: AtSign,
  share: Share2,
  message: MessageCircle,
  birthday: Cake,
  live: Radio,
  system: Bell,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  like: "text-red-500 bg-red-500/10",
  comment: "text-blue-500 bg-blue-500/10",
  friend_request: "text-green-500 bg-green-500/10",
  friend_accept: "text-green-500 bg-green-500/10",
  follow: "text-purple-500 bg-purple-500/10",
  mention: "text-yellow-500 bg-yellow-500/10",
  share: "text-orange-500 bg-orange-500/10",
  message: "text-blue-400 bg-blue-400/10",
  birthday: "text-pink-500 bg-pink-500/10",
  live: "text-red-600 bg-red-600/10",
  system: "text-muted-foreground bg-muted",
};

function getNotificationText(notification: Notification): string {
  const actorName = notification.actor?.full_name || notification.actor?.username || "Someone";
  switch (notification.type) {
    case "like":
      return `${actorName} liked your post`;
    case "comment":
      return `${actorName} commented on your post`;
    case "friend_request":
      return `${actorName} sent you a friend request`;
    case "friend_accept":
      return `${actorName} accepted your friend request`;
    case "follow":
      return `${actorName} started following you`;
    case "mention":
      return `${actorName} mentioned you in a comment`;
    case "share":
      return `${actorName} shared your post`;
    case "message":
      return `${actorName} sent you a message`;
    case "birthday":
      return `Today is ${actorName}'s birthday`;
    case "live":
      return `${actorName} started a live stream`;
    case "system":
      return notification.content || "System notification";
    default:
      return notification.content || "New notification";
  }
}

function getNotificationRoute(notification: Notification): string | null {
  switch (notification.entity_type) {
    case "post":
      return `/home`;
    case "comment":
      return `/home`;
    case "message":
      return `/messages`;
    case "user":
      return `/profile/${notification.entity_id}`;
    case "live":
      return `/live`;
    default:
      return null;
  }
}

export function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const navigate = useNavigate();
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();
  const { user } = useAuthStore();

  const acceptFriendRequest = useAcceptFriendRequest(user?.id || "");
  const rejectFriendRequest = useRejectFriendRequest(user?.id || "");

  const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
  const iconColor = NOTIFICATION_COLORS[notification.type] || "text-muted-foreground bg-muted";
  const route = getNotificationRoute(notification);

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead.mutate([notification.id]);
    }
    if (route) {
      navigate(route);
      onDismiss();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification.mutate(notification.id);
  };

  const handleAcceptFriend = (e: React.MouseEvent) => {
    e.stopPropagation();
    acceptFriendRequest.mutate(notification.entity_id, {
      onSuccess: () => {
        deleteNotification.mutate(notification.id);
      },
    });
  };

  const handleRejectFriend = (e: React.MouseEvent) => {
    e.stopPropagation();
    rejectFriendRequest.mutate(notification.entity_id, {
      onSuccess: () => {
        deleteNotification.mutate(notification.id);
      },
    });
  };

  const fallbackName = (notification.actor?.full_name || notification.actor?.username || "?")[0].toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`group relative flex items-start gap-3 px-4 py-3 transition-all duration-200 hover:bg-accent/50 cursor-pointer ${
        !notification.is_read ? "bg-primary/5" : ""
      }`}
      onClick={handleClick}
    >
      <div className="relative shrink-0">
        <Avatar
          src={notification.actor?.avatar_url}
          fallback={fallbackName}
          size="default"
        />
        <div className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background p-0.5 ring-2 ring-background`}>
          <Icon className={`h-3 w-3 ${iconColor.split(" ")[0]}`} />
        </div>
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className={`text-sm leading-snug ${!notification.is_read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
          {getNotificationText(notification)}
        </p>
        {notification.content && notification.type !== "system" && (
          <p className="mt-1 truncate text-xs text-muted-foreground/70">
            {notification.content}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground/50">
          {formatDistanceToNow(new Date(notification.created_at))}
        </p>
      </div>

      {notification.type === "friend_request" && (
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            className="rounded-full h-8 px-3"
            onClick={handleAcceptFriend}
            disabled={acceptFriendRequest.isPending || rejectFriendRequest.isPending}
          >
            {acceptFriendRequest.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full h-8 px-3"
            onClick={handleRejectFriend}
            disabled={acceptFriendRequest.isPending || rejectFriendRequest.isPending}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {notification.type !== "friend_request" && (
        <button
          onClick={handleDelete}
          className="shrink-0 rounded-xl p-1.5 text-muted-foreground/30 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {!notification.is_read && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/50" />
      )}
    </motion.div>
  );
}
