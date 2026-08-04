export interface VideoCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  videos_count: number;
}

export interface VideoUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

export interface VideoCategoryBrief {
  id: string;
  name: string;
  slug: string;
}

export interface Video {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string;
  duration: number | null;
  width: number | null;
  height: number | null;
  privacy: string;
  status: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  is_archived: boolean;
  is_liked: boolean;
  is_watch_later: boolean;
  user: VideoUser | null;
  category: VideoCategoryBrief | null;
  created_at: string | null;
}

export interface VideoListResponse {
  videos: Video[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface VideoCreate {
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  category_id?: string;
  duration?: number;
  width?: number;
  height?: number;
  privacy?: "everyone" | "friends" | "only_me";
}

export interface VideoUpdate {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  category_id?: string;
  privacy?: "everyone" | "friends" | "only_me";
}

export interface VideoComment {
  id: string;
  user_id: string;
  video_id: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  user: VideoUser | null;
  replies_count: number;
  created_at: string | null;
}

export interface VideoCommentListResponse {
  comments: VideoComment[];
  total_count: number;
}

export interface VideoCommentCreate {
  content: string;
  parent_id?: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  privacy: string;
  videos_count: number;
  is_system: boolean;
  created_at: string | null;
}

export interface PlaylistDetail extends Playlist {
  videos: Video[];
  user: VideoUser | null;
}

export interface PlaylistListResponse {
  playlists: Playlist[];
}

export interface PlaylistCreate {
  name: string;
  description?: string;
  privacy?: "everyone" | "friends" | "only_me";
}

export interface PlaylistUpdate {
  name?: string;
  description?: string;
  privacy?: "everyone" | "friends" | "only_me";
}

export interface WatchHistoryItem {
  id: string;
  video: Video | null;
  progress: number;
  completed: boolean;
  watched_at: string | null;
}

export interface WatchHistoryListResponse {
  items: WatchHistoryItem[];
}

export interface WatchLaterItem {
  video: Video | null;
  added_at: string | null;
}

export interface WatchLaterListResponse {
  items: WatchLaterItem[];
}

export interface RecommendationListResponse {
  videos: Video[];
}
