import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { feedApi } from "@/services/feedApi";
import { useUploadMedia } from "@/features/media/hooks";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { compressImage, shouldCompressImage } from "@/utils";
import type { PostCreate, PostUpdate, FeedResponse, FeedType, Media, Post } from "@/types";
import type { InfiniteData } from "@tanstack/react-query";

function updatePostInInfiniteCache(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKeyBase: readonly unknown[],
  postId: string,
  updater: (post: Post) => Post
) {
  queryClient.setQueriesData({ queryKey: queryKeyBase }, (old: InfiniteData<FeedResponse> | undefined) => {
    if (!old || !Array.isArray(old.pages)) return old;
    return {
      ...old,
      pages: old.pages.map((page: FeedResponse) => ({
        ...page,
        posts: page.posts.map((post: Post) =>
          post.id === postId ? updater(post) : post
        ),
      })),
    };
  });
}

export function useUploadToMedia() {
  const uploadMedia = useUploadMedia();
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(
    async (files: File[]): Promise<Media[]> => {
      setIsUploading(true);
      const results: Media[] = [];
      try {
        for (const file of files) {
          const mediaType = file.type.startsWith("image/")
            ? "image"
            : file.type.startsWith("video/")
            ? "video"
            : "document";

          let fileToUpload = file;
          if (mediaType === "image" && shouldCompressImage(file)) {
            try {
              fileToUpload = await compressImage(file);
            } catch {
              // Fall back to original file
            }
          }

          const resourceType =
            mediaType === "image" ? "image" : mediaType === "video" ? "video" : "raw";

          const { url } = await uploadToCloudinary(fileToUpload, resourceType);

          const media = await uploadMedia.mutateAsync({
            media_type: mediaType as "image" | "video" | "document",
            file_url: url,
            original_name: file.name,
            mime_type: file.type,
            file_size: fileToUpload.size,
            is_processed: false,
          });
          results.push(media);
        }
        return results;
      } finally {
        setIsUploading(false);
      }
    },
    [uploadMedia]
  );

  return { upload, isUploading };
}

export function useHomeFeed(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["feed", "home", userId],
    queryFn: async ({ pageParam }) => {
      const { data } = await feedApi.getHomeFeed(pageParam, 10);
      return data;
    },
    getNextPageParam: (lastPage: FeedResponse) => (lastPage.has_more ? lastPage.next_cursor : undefined),
    initialPageParam: undefined as string | undefined,
    enabled: !!userId,
    staleTime: 300_000,
    placeholderData: keepPreviousData,
  });
}

export function useForYouFeed(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["feed", "for-you", userId],
    queryFn: async ({ pageParam }) => {
      const { data } = await feedApi.getForYouPosts(pageParam, 10);
      return data;
    },
    getNextPageParam: (lastPage: FeedResponse) => (lastPage.has_more ? lastPage.next_cursor : undefined),
    initialPageParam: undefined as string | undefined,
    enabled: !!userId,
    staleTime: 300_000,
    placeholderData: keepPreviousData,
  });
}

export function useFollowingFeed(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["feed", "following", userId],
    queryFn: async ({ pageParam }) => {
      const { data } = await feedApi.getFollowingFeed(pageParam, 10);
      return data;
    },
    getNextPageParam: (lastPage: FeedResponse) => (lastPage.has_more ? lastPage.next_cursor : undefined),
    initialPageParam: undefined as string | undefined,
    enabled: !!userId,
    staleTime: 300_000,
    placeholderData: keepPreviousData,
  });
}

export function useFriendsFeed(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["feed", "friends", userId],
    queryFn: async ({ pageParam }) => {
      const { data } = await feedApi.getFriendsFeed(pageParam, 10);
      return data;
    },
    getNextPageParam: (lastPage: FeedResponse) => (lastPage.has_more ? lastPage.next_cursor : undefined),
    initialPageParam: undefined as string | undefined,
    enabled: !!userId,
    staleTime: 300_000,
    placeholderData: keepPreviousData,
  });
}

export function useTrendingFeed(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["feed", "trending", userId],
    queryFn: async ({ pageParam }) => {
      const { data } = await feedApi.getTrendingFeed(pageParam, 10);
      return data;
    },
    getNextPageParam: (lastPage: FeedResponse) => (lastPage.has_more ? lastPage.next_cursor : undefined),
    initialPageParam: undefined as string | undefined,
    enabled: !!userId,
    staleTime: 300_000,
    placeholderData: keepPreviousData,
  });
}

export function useSuggestedPosts(userId: string | undefined) {
  return useQuery({
    queryKey: ["feed", "suggested", userId],
    queryFn: async () => {
      const { data } = await feedApi.getSuggestedPosts();
      return data;
    },
    enabled: !!userId,
    staleTime: 120_000,
  });
}

export function useUserPosts(userId: string | undefined, targetUserId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["feed", "user", userId, targetUserId],
    queryFn: async ({ pageParam }) => {
      const { data } = await feedApi.getUserPosts(targetUserId!, pageParam, 10);
      return data;
    },
    getNextPageParam: (lastPage: FeedResponse) => (lastPage.has_more ? lastPage.next_cursor : undefined),
    initialPageParam: undefined as string | undefined,
    enabled: !!userId && !!targetUserId,
    staleTime: 120_000,
  });
}

export function useSavedPosts(userId: string | undefined) {
  return useQuery({
    queryKey: ["feed", "saved", userId],
    queryFn: async () => {
      const { data } = await feedApi.getSavedPosts();
      return data;
    },
    enabled: !!userId,
    staleTime: 120_000,
  });
}

export function useHiddenPosts(userId: string | undefined) {
  return useQuery({
    queryKey: ["feed", "hidden", userId],
    queryFn: async () => {
      const { data } = await feedApi.getHiddenPosts();
      return data;
    },
    enabled: !!userId,
    staleTime: 120_000,
  });
}

export function useArchivedPosts(userId: string | undefined) {
  return useQuery({
    queryKey: ["feed", "archived", userId],
    queryFn: async () => {
      const { data } = await feedApi.getArchivedPosts();
      return data;
    },
    enabled: !!userId,
    staleTime: 120_000,
  });
}

export function useDraftPosts(userId: string | undefined) {
  return useQuery({
    queryKey: ["feed", "drafts", userId],
    queryFn: async () => {
      const { data } = await feedApi.getDraftPosts();
      return data;
    },
    enabled: !!userId,
    staleTime: 120_000,
  });
}

export function useScheduledPosts(userId: string | undefined) {
  return useQuery({
    queryKey: ["feed", "scheduled", userId],
    queryFn: async () => {
      const { data } = await feedApi.getScheduledPosts();
      return data;
    },
    enabled: !!userId,
    staleTime: 120_000,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PostCreate) => {
      const { data: post } = await feedApi.createPost(data);
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, data }: { postId: string; data: PostUpdate }) => {
      const { data: post } = await feedApi.updatePost(postId, data);
      return post;
    },
    onMutate: async ({ postId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previous = queryClient.getQueriesData({ queryKey: ["feed"] });

      updatePostInInfiniteCache(queryClient, ["feed"], postId, (post) => ({
        ...post,
        ...(data as Partial<Post>),
      }));

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
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await feedApi.deletePost(postId);
    },
    onMutate: async (postId) => {
      try {
        await queryClient.cancelQueries({ queryKey: ["feed"] });
      } catch {
        // Ignore cancel errors
      }
      const previous = queryClient.getQueriesData({ queryKey: ["feed"] });

      try {
        queryClient.setQueriesData({ queryKey: ["feed"] }, (old: InfiniteData<FeedResponse> | undefined) => {
          if (!old || !Array.isArray(old.pages)) return old;
        return {
            ...old,
            pages: old.pages.map((page: FeedResponse) => ({
              ...page,
              posts: page.posts.filter((post: Post) => post.id !== postId),
            })),
          };
        });
      } catch {
        // Optimistic update failed, but don't block the API call
      }

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
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useSavePost(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await feedApi.savePost(postId);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previous = queryClient.getQueriesData({ queryKey: ["feed"] });

      updatePostInInfiniteCache(queryClient, ["feed"], postId, (post) => ({
        ...post,
        is_saved: true,
      }));

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
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["feed", "saved", userId] });
    },
  });
}

export function useUnsavePost(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await feedApi.unsavePost(postId);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previous = queryClient.getQueriesData({ queryKey: ["feed"] });

      updatePostInInfiniteCache(queryClient, ["feed"], postId, (post) => ({
        ...post,
        is_saved: false,
      }));

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
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["feed", "saved", userId] });
    },
  });
}

export function useHidePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await feedApi.hidePost(postId);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previous = queryClient.getQueriesData({ queryKey: ["feed"] });

      updatePostInInfiniteCache(queryClient, ["feed"], postId, (post) => ({
        ...post,
        is_hidden: true,
      }));

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
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useUnhidePost(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await feedApi.unhidePost(postId);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previous = queryClient.getQueriesData({ queryKey: ["feed"] });

      updatePostInInfiniteCache(queryClient, ["feed"], postId, (post) => ({
        ...post,
        is_hidden: false,
      }));

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
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["feed", "hidden", userId] });
    },
  });
}

export function usePinPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await feedApi.pinPost(postId);
      return data;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previous = queryClient.getQueriesData({ queryKey: ["feed"] });

      // Unpin all other posts first, then pin this one
      queryClient.setQueriesData({ queryKey: ["feed"] }, (old: InfiniteData<FeedResponse> | undefined) => {
        if (!old || !Array.isArray(old.pages)) return old;
        return {
          ...old,
          pages: old.pages.map((page: FeedResponse) => ({
            ...page,
            posts: page.posts.map((post: Post) => ({
              ...post,
              is_pinned: post.id === postId ? true : post.is_pinned,
            })),
          })),
        };
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
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useUnpinPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await feedApi.unpinPost(postId);
      return data;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previous = queryClient.getQueriesData({ queryKey: ["feed"] });

      updatePostInInfiniteCache(queryClient, ["feed"], postId, (post) => ({
        ...post,
        is_pinned: false,
      }));

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
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useArchivePost(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await feedApi.archivePost(postId);
      return data;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previous = queryClient.getQueriesData({ queryKey: ["feed"] });

      updatePostInInfiniteCache(queryClient, ["feed"], postId, (post) => ({
        ...post,
        is_archived: true,
      }));

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
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["feed", "archived", userId] });
    },
  });
}

export function useUnarchivePost(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await feedApi.unarchivePost(postId);
      return data;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previous = queryClient.getQueriesData({ queryKey: ["feed"] });

      updatePostInInfiniteCache(queryClient, ["feed"], postId, (post) => ({
        ...post,
        is_archived: false,
      }));

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
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["feed", "archived", userId] });
    },
  });
}

export function useVotePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      const { data } = await feedApi.votePoll(pollId, optionId);
      return data;
    },
    onMutate: async ({ pollId, optionId }) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previous = queryClient.getQueriesData({ queryKey: ["feed"] });

      queryClient.setQueriesData({ queryKey: ["feed"] }, (old: InfiniteData<FeedResponse> | undefined) => {
        if (!old || !Array.isArray(old.pages)) return old;
        return {
          ...old,
          pages: old.pages.map((page: FeedResponse) => ({
            ...page,
            posts: page.posts.map((post: Post) => {
              if (!post.poll || post.poll.id !== pollId) return post;
              return {
                ...post,
                poll: {
                  ...post.poll,
                  total_votes: post.poll.total_votes + 1,
                  options: post.poll.options.map((opt: any) =>
                    opt.id === optionId
                      ? { ...opt, votes_count: opt.votes_count + 1, has_voted: true, percentage: 0 }
                      : opt
                  ),
                },
              };
            }),
          })),
        };
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
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useRepostPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content?: string }) => {
      const { data } = await feedApi.repostPost(postId, content);
      return data;
    },
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previous = queryClient.getQueriesData({ queryKey: ["feed"] });

      updatePostInInfiniteCache(queryClient, ["feed"], postId, (post) => ({
        ...post,
        repost_count: post.repost_count + 1,
      }));

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
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useQuotePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      quoteText,
      content,
    }: {
      postId: string;
      quoteText: string;
      content?: string;
    }) => {
      const { data } = await feedApi.quotePost(postId, quoteText, content);
      return data;
    },
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previous = queryClient.getQueriesData({ queryKey: ["feed"] });

      updatePostInInfiniteCache(queryClient, ["feed"], postId, (post) => ({
        ...post,
        repost_count: post.repost_count + 1,
      }));

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
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useFeedPosition(userId: string | undefined, feedType: FeedType) {
  return useQuery({
    queryKey: ["feed", "position", userId, feedType],
    queryFn: async () => {
      const { data } = await feedApi.getFeedPosition(feedType);
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateFeedPosition(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { feed_type: FeedType; last_post_id?: string; scroll_position?: number }) => {
      const { data: position } = await feedApi.updateFeedPosition(data);
      return position;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["feed", "position", userId, variables.feed_type] });
    },
  });
}

export function usePostCount(userId: string | undefined) {
  return useQuery({
    queryKey: ["feed", "count", userId],
    queryFn: async () => {
      const { data } = await feedApi.getPostCount();
      return data;
    },
    enabled: !!userId,
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await feedApi.likePost(postId);
      return data;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previous = queryClient.getQueriesData({ queryKey: ["feed"] });

      updatePostInInfiniteCache(queryClient, ["feed"], postId, (post) => ({
        ...post,
        is_liked: true,
        likes_count: post.likes_count + 1,
      }));

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
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useUnlikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await feedApi.unlikePost(postId);
      return data;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previous = queryClient.getQueriesData({ queryKey: ["feed"] });

      updatePostInInfiniteCache(queryClient, ["feed"], postId, (post) => ({
        ...post,
        is_liked: false,
        likes_count: Math.max(0, post.likes_count - 1),
      }));

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
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
