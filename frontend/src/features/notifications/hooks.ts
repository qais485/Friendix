import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/services/notificationApi";

export function useNotifications(cursor?: string) {
  return useQuery({
    queryKey: ["notifications", cursor],
    queryFn: async () => {
      const { data } = await notificationApi.getNotifications(cursor);
      return data;
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { data } = await notificationApi.getUnreadCount();
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      await notificationApi.markAsRead({ notification_ids: notificationIds });
    },
    onMutate: async (notificationIds) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueriesData({ queryKey: ["notifications"] });

      queryClient.setQueriesData({ queryKey: ["notifications"] }, (old: any) => {
        if (!old) return old;
        if (old.notifications) {
          return {
            ...old,
            notifications: old.notifications.map((n: any) =>
              notificationIds.includes(n.id) ? { ...n, is_read: true } : n
            ),
          };
        }
        return old;
      });

      queryClient.setQueryData(["notifications", "unread-count"], (old: any) => {
        if (!old) return old;
        return { ...old, count: Math.max(0, (old.count || 0) - notificationIds.length) };
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await notificationApi.markAllAsRead();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueriesData({ queryKey: ["notifications"] });

      queryClient.setQueriesData({ queryKey: ["notifications"] }, (old: any) => {
        if (!old) return old;
        if (old.notifications) {
          return {
            ...old,
            notifications: old.notifications.map((n: any) => ({ ...n, is_read: true })),
          };
        }
        return old;
      });

      queryClient.setQueryData(["notifications", "unread-count"], { count: 0 });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await notificationApi.deleteNotification(notificationId);
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueriesData({ queryKey: ["notifications"] });

      queryClient.setQueriesData({ queryKey: ["notifications"] }, (old: any) => {
        if (!old) return old;
        if (old.notifications) {
          return {
            ...old,
            notifications: old.notifications.filter((n: any) => n.id !== notificationId),
          };
        }
        return old;
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
