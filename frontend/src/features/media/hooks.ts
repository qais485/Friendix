import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "@/services/mediaApi";
import type {
  MediaUpload,
  MediaUpdate,
  PhotoAlbumCreate,
  PhotoAlbumUpdate,
  StoryCreate,
  StoryReactionCreate,
  StoryReplyCreate,
  StoryHighlightCreate,
  StoryHighlightUpdate,
  ReelCreate,
  ReelUpdate,
  MediaType,
} from "@/types";

export function useUserMedia(targetUserId: string | undefined, mediaType?: MediaType, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["media", "user", targetUserId, mediaType, limit, offset],
    queryFn: async () => {
      const typeParam = mediaType && mediaType !== "all" ? mediaType : undefined;
      const { data } = await mediaApi.getUserMedia(targetUserId!, typeParam, limit, offset);
      return data;
    },
    enabled: !!targetUserId,
  });
}

export function useUserMediaCount(targetUserId: string | undefined, mediaType?: MediaType) {
  return useQuery({
    queryKey: ["media", "count", targetUserId, mediaType],
    queryFn: async () => {
      const typeParam = mediaType && mediaType !== "all" ? mediaType : undefined;
      const { data } = await mediaApi.getUserMediaCount(targetUserId!, typeParam);
      return data.count;
    },
    enabled: !!targetUserId,
  });
}

export function useUserMediaStats(targetUserId: string | undefined) {
  return useQuery({
    queryKey: ["media", "stats", targetUserId],
    queryFn: async () => {
      const { data } = await mediaApi.getUserMediaStats(targetUserId!);
      return data;
    },
    enabled: !!targetUserId,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: MediaUpload) => {
      const { data: media } = await mediaApi.uploadMedia(data);
      return media;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ mediaId, data }: { mediaId: string; data: MediaUpdate }) => {
      const { data: media } = await mediaApi.updateMedia(mediaId, data);
      return media;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mediaId: string) => {
      await mediaApi.deleteMedia(mediaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}

export function useUserAlbums(userId: string | undefined, targetUserId?: string) {
  return useQuery({
    queryKey: ["media", "albums", targetUserId || userId],
    queryFn: async () => {
      const { data } = await mediaApi.getUserAlbums(targetUserId);
      return data;
    },
    enabled: !!userId,
  });
}

export function useAlbum(albumId: string | undefined) {
  return useQuery({
    queryKey: ["media", "album", albumId],
    queryFn: async () => {
      const { data } = await mediaApi.getAlbum(albumId!);
      return data;
    },
    enabled: !!albumId,
  });
}

export function useAlbumPhotos(albumId: string | undefined) {
  return useQuery({
    queryKey: ["media", "album-photos", albumId],
    queryFn: async () => {
      const { data } = await mediaApi.getAlbumPhotos(albumId!);
      return data;
    },
    enabled: !!albumId,
  });
}

export function useCreateAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PhotoAlbumCreate) => {
      const { data: album } = await mediaApi.createAlbum(data);
      return album;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "albums"] });
    },
  });
}

export function useUpdateAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ albumId, data }: { albumId: string; data: PhotoAlbumUpdate }) => {
      const { data: album } = await mediaApi.updateAlbum(albumId, data);
      return album;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "albums"] });
    },
  });
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (albumId: string) => {
      await mediaApi.deleteAlbum(albumId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "albums"] });
    },
  });
}

export function useAddPhotoToAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ albumId, mediaId, caption, position }: { albumId: string; mediaId: string; caption?: string; position?: number }) => {
      const { data } = await mediaApi.addPhotoToAlbum(albumId, mediaId, caption, position);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "album-photos"] });
      queryClient.invalidateQueries({ queryKey: ["media", "albums"] });
    },
  });
}

export function useRemovePhotoFromAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ albumId, mediaId }: { albumId: string; mediaId: string }) => {
      await mediaApi.removePhotoFromAlbum(albumId, mediaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "album-photos"] });
      queryClient.invalidateQueries({ queryKey: ["media", "albums"] });
    },
  });
}

export function useActiveStories(userIds: string) {
  return useQuery({
    queryKey: ["media", "stories", userIds],
    queryFn: async () => {
      const { data } = await mediaApi.getActiveStories(userIds);
      return data;
    },
    enabled: !!userIds,
  });
}

export function useUserStories(targetUserId: string | undefined) {
  return useQuery({
    queryKey: ["media", "stories", "user", targetUserId],
    queryFn: async () => {
      const { data } = await mediaApi.getUserStories(targetUserId!);
      return data;
    },
    enabled: !!targetUserId,
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: StoryCreate) => {
      const { data: story } = await mediaApi.createStory(data);
      return story;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "stories"] });
    },
  });
}

export function useViewStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (storyId: string) => {
      const { data } = await mediaApi.viewStory(storyId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "stories"] });
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (storyId: string) => {
      await mediaApi.deleteStory(storyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "stories"] });
    },
  });
}

export function useArchiveStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (storyId: string) => {
      const { data } = await mediaApi.archiveStory(storyId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "stories"] });
      queryClient.invalidateQueries({ queryKey: ["media", "stories", "archived"] });
    },
  });
}

export function useArchivedStories(userId: string | undefined) {
  return useQuery({
    queryKey: ["media", "stories", "archived", userId],
    queryFn: async () => {
      const { data } = await mediaApi.getArchivedStories();
      return data;
    },
    enabled: !!userId,
  });
}

export function useUnarchiveStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (storyId: string) => {
      const { data } = await mediaApi.unarchiveStory(storyId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "stories"] });
      queryClient.invalidateQueries({ queryKey: ["media", "stories", "archived"] });
    },
  });
}

export function useCloseFriendsStories(userId: string | undefined) {
  return useQuery({
    queryKey: ["media", "stories", "close-friends", userId],
    queryFn: async () => {
      const { data } = await mediaApi.getCloseFriendsStories();
      return data;
    },
    enabled: !!userId,
  });
}

export function useAddStoryReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storyId, data }: { storyId: string; data: StoryReactionCreate }) => {
      const { data: reaction } = await mediaApi.addReaction(storyId, data);
      return reaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "stories"] });
    },
  });
}

export function useRemoveStoryReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (storyId: string) => {
      await mediaApi.removeReaction(storyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "stories"] });
    },
  });
}

export function useStoryReactions(storyId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ["media", "stories", "reactions", storyId, userId],
    queryFn: async () => {
      const { data } = await mediaApi.getStoryReactions(storyId!);
      return data;
    },
    enabled: !!storyId && !!userId,
  });
}

export function useStoryReactionCounts(storyId: string | undefined) {
  return useQuery({
    queryKey: ["media", "stories", "reactions", "counts", storyId],
    queryFn: async () => {
      const { data } = await mediaApi.getStoryReactionCounts(storyId!);
      return data;
    },
    enabled: !!storyId,
  });
}

export function useAddStoryReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storyId, data }: { storyId: string; data: StoryReplyCreate }) => {
      const { data: reply } = await mediaApi.addReply(storyId, data);
      return reply;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "stories"] });
    },
  });
}

export function useStoryReplies(storyId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ["media", "stories", "replies", storyId, userId],
    queryFn: async () => {
      const { data } = await mediaApi.getStoryReplies(storyId!);
      return data;
    },
    enabled: !!storyId && !!userId,
  });
}

export function useDeleteStoryReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storyId, replyId }: { storyId: string; replyId: string }) => {
      await mediaApi.deleteReply(storyId, replyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "stories"] });
    },
  });
}

export function useUserHighlights(userId: string | undefined) {
  return useQuery({
    queryKey: ["media", "highlights", userId],
    queryFn: async () => {
      const { data } = await mediaApi.getUserHighlights();
      return data;
    },
    enabled: !!userId,
  });
}

export function useHighlight(highlightId: string | undefined) {
  return useQuery({
    queryKey: ["media", "highlight", highlightId],
    queryFn: async () => {
      const { data } = await mediaApi.getHighlight(highlightId!);
      return data;
    },
    enabled: !!highlightId,
  });
}

export function useCreateHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: StoryHighlightCreate) => {
      const { data: highlight } = await mediaApi.createHighlight(data);
      return highlight;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "highlights"] });
    },
  });
}

export function useUpdateHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ highlightId, data }: { highlightId: string; data: StoryHighlightUpdate }) => {
      const { data: highlight } = await mediaApi.updateHighlight(highlightId, data);
      return highlight;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "highlights"] });
    },
  });
}

export function useDeleteHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (highlightId: string) => {
      await mediaApi.deleteHighlight(highlightId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "highlights"] });
    },
  });
}

export function useAddStoryToHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ highlightId, storyId }: { highlightId: string; storyId: string }) => {
      const { data } = await mediaApi.addStoryToHighlight(highlightId, storyId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "highlights"] });
    },
  });
}

export function useRemoveStoryFromHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ highlightId, storyId }: { highlightId: string; storyId: string }) => {
      await mediaApi.removeStoryFromHighlight(highlightId, storyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "highlights"] });
    },
  });
}

export function useUserReels(targetUserId: string | undefined, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["media", "reels", "user", targetUserId, limit, offset],
    queryFn: async () => {
      const { data } = await mediaApi.getUserReels(targetUserId!, limit, offset);
      return data;
    },
    enabled: !!targetUserId,
  });
}

export function useFeedReels(userId: string | undefined, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["media", "reels", "feed", userId, limit, offset],
    queryFn: async () => {
      const { data } = await mediaApi.getFeedReels(limit, offset);
      return data;
    },
    enabled: !!userId,
  });
}

export function useTrendingReels(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["media", "reels", "trending", limit, offset],
    queryFn: async () => {
      const { data } = await mediaApi.getTrendingReels(limit, offset);
      return data;
    },
  });
}

export function useCreateReel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ReelCreate) => {
      const { data: reel } = await mediaApi.createReel(data);
      return reel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "reels"] });
    },
  });
}

export function useUpdateReel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reelId, data }: { reelId: string; data: ReelUpdate }) => {
      const { data: reel } = await mediaApi.updateReel(reelId, data);
      return reel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "reels"] });
    },
  });
}

export function useDeleteReel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reelId: string) => {
      await mediaApi.deleteReel(reelId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media", "reels"] });
    },
  });
}

export function useCloudinarySignature() {
  return useQuery({
    queryKey: ["media", "cloudinary-signature"],
    queryFn: async () => {
      const { data } = await mediaApi.getCloudinarySignature();
      return data;
    },
  });
}
