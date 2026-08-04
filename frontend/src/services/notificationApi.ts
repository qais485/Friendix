import api from "./api";
import type {
  NotificationListResponse,
  NotificationCountResponse,
  NotificationMarkReadRequest,
} from "@/types";

export const notificationApi = {
  getNotifications: (cursor?: string, limit = 20) =>
    api.get<NotificationListResponse>("/notifications", {
      params: { cursor, limit },
    }),

  getUnreadCount: () =>
    api.get<NotificationCountResponse>("/notifications/unread-count"),

  markAsRead: (data: NotificationMarkReadRequest) =>
    api.post("/notifications/mark-read", data),

  markAllAsRead: () =>
    api.post("/notifications/mark-read", { notification_ids: [] }),

  deleteNotification: (notificationId: string) =>
    api.delete(`/notifications/${notificationId}`),
};
