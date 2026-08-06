import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { videoApi } from "@/services/videoApi";
import type { VideoCreate, VideoUpdate, PlaylistCreate, PlaylistUpdate, VideoCommentCreate } from "@/types/videos";

// ── Categories ──────────────────────────────────────────

export function useVideoCategories() {
  return useQuery({
    queryKey: ["videos", "categories"],
    queryFn: async () => {
      const { data } = await videoApi.getCategories();
      return data;
    },
    staleTime: 300_000,
  });
}

// ── Videos ──────────────────────────────────────────────

export function useVideoList(categoryId?: string, cursor?: string) {
  return useQuery({
    queryKey: ["videos", "list", categoryId, cursor],
    queryFn: async () => {
      const { data } = await videoApi.listVideos({ category_id: categoryId, cursor });
      return data;
    },
  });
}

export function useTrendingVideos(limit = 20) {
  return useQuery({
    queryKey: ["videos", "trending", limit],
    queryFn: async () => {
      const { data } = await videoApi.getTrending(limit);
      return data;
    },
  });
}

export function useSearchVideos(query: string, limit = 20) {
  return useQuery({
    queryKey: ["videos", "search", query, limit],
    queryFn: async () => {
      const { data } = await videoApi.searchVideos(query, limit);
      return data;
    },
    enabled: query.length > 0,
  });
}

export function useUserVideos(userId: string | undefined, limit = 20) {
  return useQuery({
    queryKey: ["videos", "user", userId, limit],
    queryFn: async () => {
      const { data } = await videoApi.getUserVideos(userId!, limit);
      return data;
    },
    enabled: !!userId,
  });
}

export function useVideoDetail(videoId: string | undefined) {
  return useQuery({
    queryKey: ["videos", "detail", videoId],
    queryFn: async () => {
      const { data } = await videoApi.getVideo(videoId!);
      return data;
    },
    enabled: !!videoId,
  });
}

export function useCreateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VideoCreate) => videoApi.createVideo(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useUpdateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ videoId, data }: { videoId: string; data: VideoUpdate }) => videoApi.updateVideo(videoId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => videoApi.deleteVideo(videoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

// ── Likes ───────────────────────────────────────────────

export function useToggleVideoLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => videoApi.toggleLike(videoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

// ── Comments ────────────────────────────────────────────

export function useVideoComments(videoId: string | undefined, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["videos", "comments", videoId, limit, offset],
    queryFn: async () => {
      const { data } = await videoApi.getComments(videoId!, limit, offset);
      return data;
    },
    enabled: !!videoId,
  });
}

export function useVideoCommentReplies(commentId: string | undefined, limit = 10) {
  return useQuery({
    queryKey: ["videos", "comment-replies", commentId, limit],
    queryFn: async () => {
      const { data } = await videoApi.getCommentReplies(commentId!, limit);
      return data;
    },
    enabled: !!commentId,
  });
}

export function useCreateVideoComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ videoId, data }: { videoId: string; data: VideoCommentCreate }) =>
      videoApi.createComment(videoId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["videos", "comments", variables.videoId] });
      qc.invalidateQueries({ queryKey: ["videos", "detail", variables.videoId] });
    },
  });
}

export function useDeleteVideoComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => videoApi.deleteComment(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["videos", "comments"] });
    },
  });
}

// ── Watch Later ─────────────────────────────────────────

export function useToggleWatchLater() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => videoApi.toggleWatchLater(videoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["videos"] });
      qc.invalidateQueries({ queryKey: ["videos", "watch-later"] });
    },
  });
}

export function useWatchLaterList() {
  return useQuery({
    queryKey: ["videos", "watch-later"],
    queryFn: async () => {
      const { data } = await videoApi.getWatchLater();
      return data;
    },
  });
}

// ── Playlists ───────────────────────────────────────────

export function useUserPlaylists() {
  return useQuery({
    queryKey: ["videos", "playlists"],
    queryFn: async () => {
      const { data } = await videoApi.getPlaylists();
      return data;
    },
  });
}

export function usePlaylistDetail(playlistId: string | undefined) {
  return useQuery({
    queryKey: ["videos", "playlist", playlistId],
    queryFn: async () => {
      const { data } = await videoApi.getPlaylist(playlistId!);
      return data;
    },
    enabled: !!playlistId,
  });
}

export function useCreatePlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PlaylistCreate) => videoApi.createPlaylist(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["videos", "playlists"] });
    },
  });
}

export function useUpdatePlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, data }: { playlistId: string; data: PlaylistUpdate }) =>
      videoApi.updatePlaylist(playlistId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["videos", "playlists"] });
    },
  });
}

export function useDeletePlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (playlistId: string) => videoApi.deletePlaylist(playlistId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["videos", "playlists"] });
    },
  });
}

export function useAddVideoToPlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, videoId }: { playlistId: string; videoId: string }) =>
      videoApi.addVideoToPlaylist(playlistId, videoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["videos", "playlists"] });
    },
  });
}

export function useRemoveVideoFromPlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, videoId }: { playlistId: string; videoId: string }) =>
      videoApi.removeVideoFromPlaylist(playlistId, videoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["videos", "playlists"] });
    },
  });
}

// ── Watch History ───────────────────────────────────────

export function useRecordWatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ videoId, progress }: { videoId: string; progress?: number }) =>
      videoApi.recordWatch(videoId, progress),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["videos", "history"] });
    },
  });
}

export function useWatchHistory() {
  return useQuery({
    queryKey: ["videos", "history"],
    queryFn: async () => {
      const { data } = await videoApi.getWatchHistory();
      return data;
    },
  });
}

export function useClearWatchHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => videoApi.clearWatchHistory(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["videos", "history"] });
    },
  });
}

// ── Recommendations ─────────────────────────────────────

export function useRecommendations(videoId?: string, limit = 20) {
  return useQuery({
    queryKey: ["videos", "recommendations", videoId, limit],
    queryFn: async () => {
      const { data } = await videoApi.getRecommendations(videoId, limit);
      return data;
    },
  });
}
