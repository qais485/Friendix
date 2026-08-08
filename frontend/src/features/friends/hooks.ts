import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { friendsApi } from "@/services/friendsApi";
import type {
  FavoriteUpdate,
  MuteUpdate,
  FriendDetail,
  FollowUser,
  FollowRequestDetail,
} from "@/types";

export function useFriends(userId: string | undefined, targetUserId?: string) {
  return useQuery({
    queryKey: ["friends", "list", userId, targetUserId],
    queryFn: async () => {
      const { data } = await friendsApi.getFriends(targetUserId);
      return data;
    },
    enabled: !!userId,
  });
}

export function usePendingSent(userId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "pending", "sent", userId],
    queryFn: async () => {
      const { data } = await friendsApi.getPendingSent();
      return data;
    },
    enabled: !!userId,
  });
}

export function usePendingReceived(userId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "pending", "received", userId],
    queryFn: async () => {
      const { data } = await friendsApi.getPendingReceived();
      return data;
    },
    enabled: !!userId,
  });
}

export function useFriendSuggestions(userId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "suggestions", userId],
    queryFn: async () => {
      const { data } = await friendsApi.getFriendSuggestions();
      return data;
    },
    enabled: !!userId,
  });
}

export function useMutualFriends(userId: string | undefined, otherUserId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "mutual", userId, otherUserId],
    queryFn: async () => {
      const { data } = await friendsApi.getMutualFriends(otherUserId!);
      return data;
    },
    enabled: !!userId && !!otherUserId,
  });
}

export function useFriendshipStatus(userId: string | undefined, otherUserId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "status", userId, otherUserId],
    queryFn: async () => {
      const { data } = await friendsApi.getFriendshipStatus(otherUserId!);
      return data;
    },
    enabled: !!userId && !!otherUserId,
  });
}

export function useFriendCounts(userId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "counts", userId],
    queryFn: async () => {
      const { data } = await friendsApi.getFriendCounts();
      return data;
    },
    enabled: !!userId,
  });
}

export function useFavoriteFriends(userId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "favorites", userId],
    queryFn: async () => {
      const { data } = await friendsApi.getFavoriteFriends();
      return data;
    },
    enabled: !!userId,
  });
}

export function useCloseFriends(userId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "close", userId],
    queryFn: async () => {
      const { data } = await friendsApi.getCloseFriends();
      return data;
    },
    enabled: !!userId,
  });
}

export function useFollowers(userId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "followers", userId],
    queryFn: async () => {
      const { data } = await friendsApi.getFollowers();
      return data;
    },
    enabled: !!userId,
  });
}

export function useFollowing(userId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "following", userId],
    queryFn: async () => {
      const { data } = await friendsApi.getFollowing();
      return data;
    },
    enabled: !!userId,
  });
}

export function usePendingFollowSent(userId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "follow-requests", "sent", userId],
    queryFn: async () => {
      const { data } = await friendsApi.getPendingFollowSent();
      return data;
    },
    enabled: !!userId,
  });
}

export function usePendingFollowReceived(userId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "follow-requests", "received", userId],
    queryFn: async () => {
      const { data } = await friendsApi.getPendingFollowReceived();
      return data;
    },
    enabled: !!userId,
  });
}

export function useBlockedUsers(userId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "blocked", userId],
    queryFn: async () => {
      const { data } = await friendsApi.getBlockedUsers();
      return data;
    },
    enabled: !!userId,
  });
}

export function useMutedUsers(userId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "muted", userId],
    queryFn: async () => {
      const { data } = await friendsApi.getMutedUsers();
      return data;
    },
    enabled: !!userId,
  });
}

export function useRestrictedUsers(userId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "restricted", userId],
    queryFn: async () => {
      const { data } = await friendsApi.getRestrictedUsers();
      return data;
    },
    enabled: !!userId,
  });
}

export function useRelationshipSummary(userId: string | undefined, otherUserId: string | undefined) {
  return useQuery({
    queryKey: ["friends", "summary", userId, otherUserId],
    queryFn: async () => {
      const { data } = await friendsApi.getRelationshipSummary(otherUserId!);
      return data;
    },
    enabled: !!userId && !!otherUserId,
  });
}

export function useSendFriendRequest(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (addresseeId: string) => {
      const { data } = await friendsApi.sendFriendRequest({ addressee_id: addresseeId });
      return data;
    },
    onMutate: async (addresseeId) => {
      await queryClient.cancelQueries({ queryKey: ["friends", "suggestions", userId] });
      const previous = queryClient.getQueryData(["friends", "suggestions", userId]);

      // Optimistically remove from suggestions
      queryClient.setQueryData(["friends", "suggestions", userId], (old: FriendDetail[] | undefined) => {
        if (!Array.isArray(old)) return old;
        return old.filter((s) => s.id !== addresseeId);
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["friends", "suggestions", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "pending", "sent", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "suggestions", userId] });
    },
  });
}

export function useAcceptFriendRequest(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      const { data } = await friendsApi.acceptFriendRequest(friendshipId);
      return data;
    },
    onMutate: async (friendshipId) => {
      await queryClient.cancelQueries({ queryKey: ["friends", "pending", "received", userId] });
      const previous = queryClient.getQueryData(["friends", "pending", "received", userId]);

      queryClient.setQueryData(["friends", "pending", "received", userId], (old: FriendDetail[] | undefined) => {
        if (!Array.isArray(old)) return old;
        return old.filter((r) => r.friendship_id !== friendshipId);
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["friends", "pending", "received", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "pending", "received", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "list", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "counts", userId] });
    },
  });
}

export function useRejectFriendRequest(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      await friendsApi.rejectFriendRequest(friendshipId);
    },
    onMutate: async (friendshipId) => {
      await queryClient.cancelQueries({ queryKey: ["friends", "pending", "received", userId] });
      const previous = queryClient.getQueryData(["friends", "pending", "received", userId]);

      queryClient.setQueryData(["friends", "pending", "received", userId], (old: FriendDetail[] | undefined) => {
        if (!Array.isArray(old)) return old;
        return old.filter((r) => r.friendship_id !== friendshipId);
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["friends", "pending", "received", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "pending", "received", userId] });
    },
  });
}

export function useCancelFriendRequest(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      await friendsApi.cancelFriendRequest(friendshipId);
    },
    onMutate: async (friendshipId) => {
      await queryClient.cancelQueries({ queryKey: ["friends", "pending", "sent", userId] });
      const previous = queryClient.getQueryData(["friends", "pending", "sent", userId]);

      queryClient.setQueryData(["friends", "pending", "sent", userId], (old: FriendDetail[] | undefined) => {
        if (!Array.isArray(old)) return old;
        return old.filter((r) => r.friendship_id !== friendshipId);
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["friends", "pending", "sent", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "pending", "sent", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "suggestions", userId] });
    },
  });
}

export function useRemoveFriend(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (friendId: string) => {
      await friendsApi.removeFriend(friendId);
    },
    onMutate: async (friendId) => {
      await queryClient.cancelQueries({ queryKey: ["friends", "list", userId] });
      const previous = queryClient.getQueryData(["friends", "list", userId]);

      queryClient.setQueryData(["friends", "list", userId], (old: FriendDetail[] | undefined) => {
        if (!Array.isArray(old)) return old;
        return old.filter((f) => f.id !== friendId);
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["friends", "list", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "list", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "counts", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "close", userId] });
    },
  });
}

export function useUpdateFavorite(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ friendId, data }: { friendId: string; data: FavoriteUpdate }) => {
      const { data: updated } = await friendsApi.updateFavorite(friendId, data);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "list", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "favorites", userId] });
    },
  });
}

export function useAddCloseFriend(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (friendId: string) => {
      const { data } = await friendsApi.addCloseFriend(friendId);
      return data;
    },
    onMutate: async (friendId) => {
      await queryClient.cancelQueries({ queryKey: ["friends", "list", userId] });
      const previous = queryClient.getQueryData(["friends", "list", userId]);

      queryClient.setQueryData(["friends", "list", userId], (old: FriendDetail[] | undefined) => {
        if (!Array.isArray(old)) return old;
        return old.map((f) =>
          f.id === friendId ? { ...f, is_close_friend: true } : f
        );
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["friends", "list", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "list", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "close", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "counts", userId] });
    },
  });
}

export function useRemoveCloseFriend(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (friendId: string) => {
      await friendsApi.removeCloseFriend(friendId);
    },
    onMutate: async (friendId) => {
      await queryClient.cancelQueries({ queryKey: ["friends", "list", userId] });
      const previous = queryClient.getQueryData(["friends", "list", userId]);

      queryClient.setQueryData(["friends", "list", userId], (old: FriendDetail[] | undefined) => {
        if (!Array.isArray(old)) return old;
        return old.map((f) =>
          f.id === friendId ? { ...f, is_close_friend: false } : f
        );
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["friends", "list", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "list", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "close", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "counts", userId] });
    },
  });
}

export function useFollow(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (followingId: string) => {
      await friendsApi.followUser(followingId);
    },
    onMutate: async (followingId) => {
      await queryClient.cancelQueries({ queryKey: ["friends", "following", userId] });
      const previous = queryClient.getQueryData(["friends", "following", userId]);

      queryClient.setQueryData(["friends", "following", userId], (old: FollowUser[] | undefined) => {
        if (!Array.isArray(old)) return old;
        return [...old, {
          id: followingId,
          full_name: null,
          username: null,
          avatar_url: null,
          bio: null,
          is_verified: false,
          is_friend: false,
          mutual_friends_count: 0,
        }];
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["friends", "following", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "following", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "counts", userId] });
    },
  });
}

export function useUnfollow(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (followingId: string) => {
      await friendsApi.unfollowUser(followingId);
    },
    onMutate: async (followingId) => {
      await queryClient.cancelQueries({ queryKey: ["friends", "following", userId] });
      const previous = queryClient.getQueryData(["friends", "following", userId]);

      queryClient.setQueryData(["friends", "following", userId], (old: FollowUser[] | undefined) => {
        if (!Array.isArray(old)) return old;
        return old.filter((f) => f.id !== followingId);
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["friends", "following", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "following", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "counts", userId] });
    },
  });
}

export function useRemoveFollower(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (followerId: string) => {
      await friendsApi.removeFollower(followerId);
    },
    onMutate: async (followerId) => {
      await queryClient.cancelQueries({ queryKey: ["friends", "followers", userId] });
      const previous = queryClient.getQueryData(["friends", "followers", userId]);

      queryClient.setQueryData(["friends", "followers", userId], (old: FollowUser[] | undefined) => {
        if (!Array.isArray(old)) return old;
        return old.filter((f) => f.id !== followerId);
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["friends", "followers", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "followers", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "counts", userId] });
    },
  });
}

export function useSendFollowRequest(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const { data } = await friendsApi.sendFollowRequest(targetId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "follow-requests", "sent", userId] });
    },
  });
}

export function useAcceptFollowRequest(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data } = await friendsApi.acceptFollowRequest(requestId);
      return data;
    },
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: ["friends", "follow-requests", "received", userId] });
      const previous = queryClient.getQueryData(["friends", "follow-requests", "received", userId]);

      queryClient.setQueryData(["friends", "follow-requests", "received", userId], (old: FollowRequestDetail[] | undefined) => {
        if (!Array.isArray(old)) return old;
        return old.filter((r) => r.id !== requestId);
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["friends", "follow-requests", "received", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "follow-requests", "received", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "followers", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "counts", userId] });
    },
  });
}

export function useRejectFollowRequest(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      await friendsApi.rejectFollowRequest(requestId);
    },
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: ["friends", "follow-requests", "received", userId] });
      const previous = queryClient.getQueryData(["friends", "follow-requests", "received", userId]);

      queryClient.setQueryData(["friends", "follow-requests", "received", userId], (old: FollowRequestDetail[] | undefined) => {
        if (!Array.isArray(old)) return old;
        return old.filter((r) => r.id !== requestId);
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["friends", "follow-requests", "received", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "follow-requests", "received", userId] });
    },
  });
}

export function useCancelFollowRequest(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      await friendsApi.cancelFollowRequest(requestId);
    },
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: ["friends", "follow-requests", "sent", userId] });
      const previous = queryClient.getQueryData(["friends", "follow-requests", "sent", userId]);

      queryClient.setQueryData(["friends", "follow-requests", "sent", userId], (old: FollowRequestDetail[] | undefined) => {
        if (!Array.isArray(old)) return old;
        return old.filter((r) => r.id !== requestId);
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["friends", "follow-requests", "sent", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "follow-requests", "sent", userId] });
    },
  });
}

export function useBlockUser(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (blockedUserId: string) => {
      const { data } = await friendsApi.blockUser(blockedUserId);
      return data;
    },
    onMutate: async (blockedUserId) => {
      await queryClient.cancelQueries({ queryKey: ["friends", "list", userId] });
      const previous = queryClient.getQueryData(["friends", "list", userId]);

      queryClient.setQueryData(["friends", "list", userId], (old: FriendDetail[] | undefined) => {
        if (!Array.isArray(old)) return old;
        return old.filter((f) => f.id !== blockedUserId);
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["friends", "list", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "blocked", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "list", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "followers", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "following", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", "counts", userId] });
    },
  });
}

export function useUnblockUser(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (blockedUserId: string) => {
      await friendsApi.unblockUser(blockedUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "blocked", userId] });
    },
  });
}

export function useMuteUser(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ mutedUserId, data }: { mutedUserId: string; data?: MuteUpdate }) => {
      const { data: result } = await friendsApi.muteUser(mutedUserId, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "muted", userId] });
    },
  });
}

export function useUnmuteUser(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mutedUserId: string) => {
      await friendsApi.unmuteUser(mutedUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "muted", userId] });
    },
  });
}

export function useRestrictUser(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (restrictedUserId: string) => {
      const { data } = await friendsApi.restrictUser(restrictedUserId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "restricted", userId] });
    },
  });
}

export function useUnrestrictUser(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (restrictedUserId: string) => {
      await friendsApi.unrestrictUser(restrictedUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", "restricted", userId] });
    },
  });
}
