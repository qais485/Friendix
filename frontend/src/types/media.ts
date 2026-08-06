export interface Media {
  id: string;
  user_id: string;
  media_type: "image" | "video" | "audio" | "document" | "live_photo";
  file_url: string;
  thumbnail_url: string | null;
  original_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  alt_text: string | null;
  caption: string | null;
  cloudinary_public_id: string | null;
  is_processed: boolean;
  metadata_json: string | null;
  privacy: "everyone" | "friends" | "only_me";
  created_at: string;
  updated_at: string;
}

export interface PhotoAlbum {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_media_id: string | null;
  privacy: "everyone" | "friends" | "only_me";
  media_count: number;
  created_at: string;
  updated_at: string;
}

export interface AlbumPhoto {
  id: string;
  album_id: string;
  media_id: string;
  position: number;
  caption: string | null;
  created_at: string;
}

export interface StoryUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

export interface Story {
  id: string;
  user_id: string;
  media_id: string | null;
  content: string | null;
  background_color: string | null;
  story_type: "media" | "text" | "reel" | "music";
  music_url: string | null;
  music_name: string | null;
  music_artist: string | null;
  music_cover_url: string | null;
  is_close_friends_only: boolean;
  expires_at: string;
  views_count: number;
  is_archived: boolean;
  viewed: boolean;
  created_at: string;
  updated_at: string;
  media?: Media;
  user?: StoryUser;
}

export interface StoryView {
  id: string;
  story_id: string;
  user_id: string;
  created_at: string;
}

export interface StoryReaction {
  id: string;
  story_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface StoryReply {
  id: string;
  story_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface StoryHighlight {
  id: string;
  user_id: string;
  title: string;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
  items?: StoryHighlightItem[];
}

export interface StoryHighlightItem {
  id: string;
  highlight_id: string;
  story_id: string;
  position: number;
  created_at: string;
}

export interface Reel {
  id: string;
  user_id: string;
  media_id: string;
  caption: string | null;
  audio_url: string | null;
  audio_name: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  width: number | null;
  height: number | null;
  privacy: "everyone" | "friends" | "only_me";
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  media?: Media;
}

export interface MediaUpload {
  media_type: "image" | "video" | "audio" | "document" | "live_photo";
  file_url: string;
  thumbnail_url?: string;
  original_name?: string;
  mime_type?: string;
  file_size?: number;
  width?: number;
  height?: number;
  duration?: number;
  alt_text?: string;
  caption?: string;
  cloudinary_public_id?: string;
  privacy?: "everyone" | "friends" | "only_me";
  is_processed?: boolean;
  metadata_json?: string;
}

export interface MediaUpdate {
  alt_text?: string;
  caption?: string;
}

export interface PhotoAlbumCreate {
  name: string;
  description?: string;
  cover_media_id?: string;
  privacy?: "everyone" | "friends" | "only_me";
}

export interface PhotoAlbumUpdate {
  name?: string;
  description?: string;
  cover_media_id?: string;
  privacy?: "everyone" | "friends" | "only_me";
}

export interface StoryCreate {
  media_id?: string;
  content?: string;
  background_color?: string;
  story_type?: "media" | "text" | "reel" | "music";
  music_url?: string;
  music_name?: string;
  music_artist?: string;
  music_cover_url?: string;
  is_close_friends_only?: boolean;
}

export interface StoryReactionCreate {
  emoji: string;
}

export interface StoryReplyCreate {
  content: string;
}

export interface StoryHighlightCreate {
  title: string;
  cover_url?: string;
}

export interface StoryHighlightUpdate {
  title?: string;
  cover_url?: string;
}

export interface ReelCreate {
  media_id: string;
  caption?: string;
  audio_url?: string;
  audio_name?: string;
  privacy?: "everyone" | "friends" | "only_me";
}

export interface ReelUpdate {
  caption?: string;
  audio_url?: string;
  audio_name?: string;
  privacy?: "everyone" | "friends" | "only_me";
}

export interface MediaStats {
  total_media: number;
  images: number;
  videos: number;
  audio: number;
  albums: number;
  reels: number;
  stories: number;
}

export interface CloudinarySignature {
  timestamp: number;
  signature: string;
  api_key: string;
  cloud_name: string;
  folder: string;
  resource_type: string;
}

export type MediaType = "image" | "video" | "audio" | "document" | "live_photo" | "all";
export type MediaTab = "all" | "images" | "videos" | "audio" | "documents" | "live_photos" | "albums" | "reels" | "stories";
