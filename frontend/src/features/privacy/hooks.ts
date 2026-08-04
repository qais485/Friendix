import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { privacyApi } from "@/services/privacyApi";
import type { PrivacySetting, PrivacySettingUpdate } from "@/types";

export function usePrivacySettings(userId: string | undefined) {
  return useQuery({
    queryKey: ["privacy", "settings", userId],
    queryFn: async () => {
      const { data } = await privacyApi.getPrivacySettings();
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdatePrivacySettings(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PrivacySettingUpdate) => {
      const { data: updated } = await privacyApi.updatePrivacySettings(data);
      return updated;
    },
    onSuccess: (updated: PrivacySetting) => {
      queryClient.setQueryData(["privacy", "settings", userId], updated);
    },
  });
}

export function useBlockedUsers(userId: string | undefined) {
  return useQuery({
    queryKey: ["privacy", "blocked", userId],
    queryFn: async () => {
      const { data } = await privacyApi.getBlockedUsers();
      return data;
    },
    enabled: !!userId,
  });
}

export function useMutedUsers(userId: string | undefined) {
  return useQuery({
    queryKey: ["privacy", "muted", userId],
    queryFn: async () => {
      const { data } = await privacyApi.getMutedUsers();
      return data;
    },
    enabled: !!userId,
  });
}

export function useRestrictedUsers(userId: string | undefined) {
  return useQuery({
    queryKey: ["privacy", "restricted", userId],
    queryFn: async () => {
      const { data } = await privacyApi.getRestrictedUsers();
      return data;
    },
    enabled: !!userId,
  });
}

export function useBlockUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockedUserId: string) => {
      await privacyApi.blockUser({ blocked_user_id: blockedUserId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy", "blocked", userId] });
    },
  });
}

export function useUnblockUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockedUserId: string) => {
      await privacyApi.unblockUser(blockedUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy", "blocked", userId] });
    },
  });
}

export function useMuteUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mutedUserId: string) => {
      await privacyApi.muteUser({ blocked_user_id: mutedUserId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy", "muted", userId] });
    },
  });
}

export function useUnmuteUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mutedUserId: string) => {
      await privacyApi.unmuteUser(mutedUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy", "muted", userId] });
    },
  });
}

export function useRestrictUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restrictedUserId: string) => {
      await privacyApi.restrictUser({ blocked_user_id: restrictedUserId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy", "restricted", userId] });
    },
  });
}

export function useUnrestrictUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restrictedUserId: string) => {
      await privacyApi.unrestrictUser(restrictedUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy", "restricted", userId] });
    },
  });
}
