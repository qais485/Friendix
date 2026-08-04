import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications, useMarkAllAsRead } from "../hooks";
import { NotificationItem } from "./NotificationItem";
import { notificationApi } from "@/services/notificationApi";
import type { Notification } from "@/types";

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useNotifications();
  const markAllAsRead = useMarkAllAsRead();
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const notifications = allNotifications.length > 0 ? allNotifications : (data?.notifications ?? []);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const { data: moreData } = await notificationApi.getNotifications(cursor, 20);
      if (moreData.notifications.length > 0) {
        setAllNotifications((prev) => [...prev, ...moreData.notifications]);
        setCursor(moreData.notifications[moreData.notifications.length - 1].id);
        setHasMore(moreData.has_more);
      } else {
        setHasMore(false);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, hasMore, isLoadingMore]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-[380px] max-h-[520px] rounded-3xl glass-card shadow-float overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
        <h3 className="text-base font-bold tracking-tight">Notifications</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              markAllAsRead.mutate();
              setAllNotifications([]);
              queryClient.invalidateQueries({ queryKey: ["notifications"] });
            }}
            className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95"
            title="Mark all as read"
          >
            <CheckCheck className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <CheckCheck className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">All caught up</p>
            <p className="mt-0.5 text-xs text-muted-foreground">No new notifications</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onDismiss={onClose}
              />
            ))}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full py-3 text-sm font-medium text-primary hover:bg-accent transition-all duration-200 disabled:opacity-50"
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
