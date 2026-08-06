import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/services/profileApi";
import type { Profile, ProfileUpdate, AvatarUpdate, CoverPhotoUpdate } from "@/types";

export function useMyProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", "me", userId],
    queryFn: async () => {
      const { data } = await profileApi.getMyProfile();
      return data;
    },
    enabled: !!userId,
    staleTime: 120_000,
  });
}

export function usePublicProfile(username: string | undefined) {
  return useQuery({
    queryKey: ["profile", "public", username],
    queryFn: async () => {
      const { data } = await profileApi.getPublicProfile(username!);
      return data;
    },
    enabled: !!username,
    staleTime: 120_000,
  });
}

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileUpdate) => {
      const { data: updated } = await profileApi.updateProfile(data);
      return updated;
    },
    onSuccess: (updated: Profile) => {
      queryClient.setQueryData(["profile", "me", userId], updated);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useUpdateAvatar(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AvatarUpdate) => {
      const { data: updated } = await profileApi.updateAvatar(data);
      return updated;
    },
    onSuccess: (updated: Profile) => {
      queryClient.setQueryData(["profile", "me", userId], updated);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useUpdateCoverPhoto(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CoverPhotoUpdate) => {
      const { data: updated } = await profileApi.updateCoverPhoto(data);
      return updated;
    },
    onSuccess: (updated: Profile) => {
      queryClient.setQueryData(["profile", "me", userId], updated);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useCheckUsername() {
  return useMutation({
    mutationFn: async (username: string) => {
      const { data } = await profileApi.checkUsername({ username });
      return data;
    },
  });
}

export function useUpdateUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      const { data } = await profileApi.updateUsername({ username });
      return data;
    },
    onSuccess: (updated: Profile) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.setQueryData(["profile", "me", updated.id], updated);
    },
  });
}

export function useSearchUsers() {
  return useMutation({
    mutationFn: async (query: string) => {
      const { data } = await profileApi.searchUsers(query);
      return data;
    },
  });
}
