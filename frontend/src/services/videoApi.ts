import api from "./api";
import type {
  Video, VideoListResponse, VideoCreate, VideoUpdate,
  VideoComment, VideoCommentListResponse, VideoCommentCreate,
  VideoCategory,
  Playlist, PlaylistDetail, PlaylistListResponse, PlaylistCreate, PlaylistUpdate,
  WatchHistoryListResponse,
  WatchLaterListResponse,
} from "@/types/videos";

export const videoApi = {
  // Categories
  getCategories: () => api.get<VideoCategory[]>("/videos/categories"),

  // Videos
  createVideo: (data: VideoCreate) => api.post<Video>("/videos", data),
  listVideos: (params?: { category_id?: string; cursor?: string; limit?: number }) =>
    api.get<VideoListResponse>("/videos", { params }),
  getTrending: (limit?: number) =>
    api.get<VideoListResponse>("/videos/trending", { params: { limit } }),
  searchVideos: (q: string, limit?: number) =>
    api.get<VideoListResponse>("/videos/search", { params: { q, limit } }),
  getUserVideos: (userId: string, limit?: number, offset?: number) =>
    api.get<VideoListResponse>(`/videos/user/${userId}`, { params: { limit, offset } }),
  getVideo: (videoId: string) => api.get<Video>(`/videos/${videoId}`),
  updateVideo: (videoId: string, data: VideoUpdate) => api.put<Video>(`/videos/${videoId}`, data),
  deleteVideo: (videoId: string) => api.delete(`/videos/${videoId}`),

  // Likes
  toggleLike: (videoId: string) => api.post<{ is_liked: boolean; likes_count: number }>(`/videos/${videoId}/like`),

  // Comments
  createComment: (videoId: string, data: VideoCommentCreate) =>
    api.post<VideoComment>(`/videos/${videoId}/comments`, data),
  getComments: (videoId: string, limit?: number, offset?: number) =>
    api.get<VideoCommentListResponse>(`/videos/${videoId}/comments`, { params: { limit, offset } }),
  getCommentReplies: (commentId: string, limit?: number) =>
    api.get<VideoComment[]>(`/videos/comments/${commentId}/replies`, { params: { limit } }),
  deleteComment: (commentId: string) => api.delete(`/videos/comments/${commentId}`),

  // Watch Later
  toggleWatchLater: (videoId: string) =>
    api.post<{ is_watch_later: boolean }>(`/videos/${videoId}/watch-later`),
  getWatchLater: () => api.get<WatchLaterListResponse>("/videos/watch-later/list"),

  // Playlists
  createPlaylist: (data: PlaylistCreate) => api.post<Playlist>("/videos/playlists", data),
  getPlaylists: () => api.get<PlaylistListResponse>("/videos/playlists"),
  getPlaylist: (playlistId: string) => api.get<PlaylistDetail>(`/videos/playlists/${playlistId}`),
  updatePlaylist: (playlistId: string, data: PlaylistUpdate) =>
    api.put<Playlist>(`/videos/playlists/${playlistId}`, data),
  deletePlaylist: (playlistId: string) => api.delete(`/videos/playlists/${playlistId}`),
  addVideoToPlaylist: (playlistId: string, videoId: string) =>
    api.post(`/videos/playlists/${playlistId}/videos/${videoId}`),
  removeVideoFromPlaylist: (playlistId: string, videoId: string) =>
    api.delete(`/videos/playlists/${playlistId}/videos/${videoId}`),

  // Watch History
  recordWatch: (videoId: string, progress?: number) =>
    api.post(`/videos/${videoId}/history`, null, { params: { progress } }),
  getWatchHistory: () => api.get<WatchHistoryListResponse>("/videos/history/list"),
  clearWatchHistory: () => api.delete("/videos/history"),

  // Recommendations
  getRecommendations: (_videoId?: string, limit?: number) =>
    api.get<VideoListResponse>("/feed/for-you/videos", { params: { limit } }),
};
