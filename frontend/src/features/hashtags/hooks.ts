import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hashtagApi } from "@/services/hashtagApi";

export function useTrendingHashtags(limit = 20) {
  return useQuery({
    queryKey: ["hashtags", "trending", limit],
    queryFn: async () => {
      const { data } = await hashtagApi.getTrending(limit);
      return data.hashtags;
    },
    staleTime: 60000,
  });
}

export function useSearchHashtags(query: string, limit = 20) {
  return useQuery({
    queryKey: ["hashtags", "search", query, limit],
    queryFn: async () => {
      const { data } = await hashtagApi.search(query, limit);
      return data.hashtags;
    },
    enabled: query.length > 0,
    staleTime: 30000,
  });
}

export function useHashtagDetail(name: string) {
  return useQuery({
    queryKey: ["hashtags", "detail", name],
    queryFn: async () => {
      const { data } = await hashtagApi.getDetail(name);
      return data;
    },
    enabled: name.length > 0,
    staleTime: 30000,
  });
}

export function useHashtagPosts(name: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["hashtags", "posts", name, limit, offset],
    queryFn: async () => {
      const { data } = await hashtagApi.getPosts(name, limit, offset);
      return data;
    },
    enabled: name.length > 0,
    staleTime: 15000,
  });
}

export function useFollowHashtag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await hashtagApi.follow(name);
      return data;
    },
    onSuccess: (_, name) => {
      queryClient.invalidateQueries({ queryKey: ["hashtags", "detail", name] });
      queryClient.invalidateQueries({ queryKey: ["hashtags", "trending"] });
      queryClient.invalidateQueries({ queryKey: ["hashtags", "followed"] });
    },
  });
}

export function useUnfollowHashtag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await hashtagApi.unfollow(name);
      return data;
    },
    onSuccess: (_, name) => {
      queryClient.invalidateQueries({ queryKey: ["hashtags", "detail", name] });
      queryClient.invalidateQueries({ queryKey: ["hashtags", "trending"] });
      queryClient.invalidateQueries({ queryKey: ["hashtags", "followed"] });
    },
  });
}

export function useFollowedHashtags(limit = 50) {
  return useQuery({
    queryKey: ["hashtags", "followed", limit],
    queryFn: async () => {
      const { data } = await hashtagApi.getFollowed(limit);
      return data.hashtags;
    },
    staleTime: 30000,
  });
}

export function useCreateHashtag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data } = await hashtagApi.create(name, description);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hashtags", "trending"] });
    },
  });
}
