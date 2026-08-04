import api from "./api";
import type {
  Media,
  MediaUpload,
  MediaUpdate,
  PhotoAlbum,
  PhotoAlbumCreate,
  PhotoAlbumUpdate,
  AlbumPhoto,
  Story,
  StoryCreate,
  StoryView,
  StoryReaction,
  StoryReactionCreate,
  StoryReply,
  StoryReplyCreate,
  StoryHighlight,
  StoryHighlightCreate,
  StoryHighlightUpdate,
  Reel,
  ReelCreate,
  ReelUpdate,
  MediaStats,
  CloudinarySignature,
} from "@/types";

export const mediaApi = {
  uploadMedia: (data: MediaUpload) =>
    api.post<Media>("/media/upload", data),

  getMedia: (mediaId: string) =>
    api.get<Media>(`/media/media/${mediaId}`),

  getUserMedia: (targetUserId: string, mediaType?: string, limit = 20, offset = 0) =>
    api.get<Media[]>(`/media/user/${targetUserId}`, {
      params: { media_type: mediaType, limit, offset },
    }),

  getUserMediaCount: (targetUserId: string, mediaType?: string) =>
    api.get<{ count: number }>(`/media/user/${targetUserId}/count`, {
      params: { media_type: mediaType },
    }),

  getUserMediaStats: (targetUserId: string) =>
    api.get<MediaStats>(`/media/user/${targetUserId}/stats`),

  updateMedia: (mediaId: string, data: MediaUpdate) =>
    api.put<Media>(`/media/media/${mediaId}`, data),

  deleteMedia: (mediaId: string) =>
    api.delete(`/media/media/${mediaId}`),

  createAlbum: (data: PhotoAlbumCreate) =>
    api.post<PhotoAlbum>("/media/albums", data),

  getUserAlbums: (targetUserId?: string) =>
    api.get<PhotoAlbum[]>("/media/albums", {
      params: targetUserId ? { target_user_id: targetUserId } : {},
    }),

  getAlbum: (albumId: string) =>
    api.get<PhotoAlbum>(`/media/albums/${albumId}`),

  updateAlbum: (albumId: string, data: PhotoAlbumUpdate) =>
    api.put<PhotoAlbum>(`/media/albums/${albumId}`, data),

  deleteAlbum: (albumId: string) =>
    api.delete(`/media/albums/${albumId}`),

  addPhotoToAlbum: (albumId: string, mediaId: string, caption?: string, position?: number) =>
    api.post<AlbumPhoto>(`/media/albums/${albumId}/photos`, {
      media_id: mediaId,
      caption,
      position,
    }),

  removePhotoFromAlbum: (albumId: string, mediaId: string) =>
    api.delete(`/media/albums/${albumId}/photos/${mediaId}`),

  getAlbumPhotos: (albumId: string) =>
    api.get<AlbumPhoto[]>(`/media/albums/${albumId}/photos`),

  createStory: (data: StoryCreate) =>
    api.post<Story>("/media/stories", data),

  getActiveStories: (userIds: string) =>
    api.get<Story[]>("/media/stories", {
      params: { user_ids: userIds },
    }),

  getUserStories: (targetUserId: string) =>
    api.get<Story[]>(`/media/stories/user/${targetUserId}`),

  viewStory: (storyId: string) =>
    api.post<StoryView>(`/media/stories/${storyId}/view`),

  getStoryViewers: (storyId: string) =>
    api.get<StoryView[]>(`/media/stories/${storyId}/viewers`),

  deleteStory: (storyId: string) =>
    api.delete(`/media/stories/${storyId}`),

  archiveStory: (storyId: string) =>
    api.post<Story>(`/media/stories/${storyId}/archive`),

  getArchivedStories: () =>
    api.get<Story[]>("/media/stories/archived"),

  unarchiveStory: (storyId: string) =>
    api.post<Story>(`/media/stories/${storyId}/unarchive`),

  getCloseFriendsStories: () =>
    api.get<Story[]>("/media/stories/close-friends"),

  addReaction: (storyId: string, data: StoryReactionCreate) =>
    api.post<StoryReaction>(`/media/stories/${storyId}/reactions`, data),

  removeReaction: (storyId: string) =>
    api.delete(`/media/stories/${storyId}/reactions`),

  getStoryReactions: (storyId: string) =>
    api.get<StoryReaction[]>(`/media/stories/${storyId}/reactions`),

  getStoryReactionCounts: (storyId: string) =>
    api.get<Record<string, number>>(`/media/stories/${storyId}/reactions/counts`),

  addReply: (storyId: string, data: StoryReplyCreate) =>
    api.post<StoryReply>(`/media/stories/${storyId}/replies`, data),

  getStoryReplies: (storyId: string) =>
    api.get<StoryReply[]>(`/media/stories/${storyId}/replies`),

  deleteReply: (storyId: string, replyId: string) =>
    api.delete(`/media/stories/${storyId}/replies/${replyId}`),

  createHighlight: (data: StoryHighlightCreate) =>
    api.post<StoryHighlight>("/media/highlights", data),

  getUserHighlights: () =>
    api.get<StoryHighlight[]>("/media/highlights"),

  getHighlight: (highlightId: string) =>
    api.get<StoryHighlight>(`/media/highlights/${highlightId}`),

  updateHighlight: (highlightId: string, data: StoryHighlightUpdate) =>
    api.put<StoryHighlight>(`/media/highlights/${highlightId}`, data),

  deleteHighlight: (highlightId: string) =>
    api.delete(`/media/highlights/${highlightId}`),

  addStoryToHighlight: (highlightId: string, storyId: string) =>
    api.post(`/media/highlights/${highlightId}/stories/${storyId}`),

  removeStoryFromHighlight: (highlightId: string, storyId: string) =>
    api.delete(`/media/highlights/${highlightId}/stories/${storyId}`),

  createReel: (data: ReelCreate) =>
    api.post<Reel>("/media/reels", data),

  getReel: (reelId: string) =>
    api.get<Reel>(`/media/reels/${reelId}`),

  getUserReels: (targetUserId: string, limit = 20, offset = 0) =>
    api.get<Reel[]>(`/media/reels/user/${targetUserId}`, {
      params: { limit, offset },
    }),

  getFeedReels: (limit = 20, offset = 0) =>
    api.get<Reel[]>("/media/reels/feed", {
      params: { limit, offset },
    }),

  getTrendingReels: (limit = 20, offset = 0) =>
    api.get<Reel[]>("/media/reels/trending", {
      params: { limit, offset },
    }),

  updateReel: (reelId: string, data: ReelUpdate) =>
    api.put<Reel>(`/media/reels/${reelId}`, data),

  deleteReel: (reelId: string) =>
    api.delete(`/media/reels/${reelId}`),

  getCloudinarySignature: (folder = "friendix", resourceType = "image") =>
    api.get<CloudinarySignature>("/media/cloudinary/sign", {
      params: { folder, resource_type: resourceType },
    }),
};
