export interface PostAuthor {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes_count: number;
  percentage: number;
  has_voted: boolean;
}

export interface Poll {
  id: string;
  question: string;
  ends_at: string | null;
  is_anonymous: boolean;
  total_votes: number;
  options: PollOption[];
  has_voted: boolean;
  is_expired: boolean;
}

export interface PollCreate {
  question: string;
  options: { text: string }[];
  ends_at?: string;
  is_anonymous?: boolean;
}

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  image_urls: string[] | null;
  video_url: string | null;
  audio_url: string | null;
  gif_url: string | null;
  document_url: string | null;
  document_name: string | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  feeling_type: string | null;
  feeling_text: string | null;
  background_style: string | null;
  background_image_url: string | null;
  aspect_ratio: string | null;
  post_type: PostType;
  privacy: "everyone" | "friends" | "close_friends" | "followers" | "friends_followers" | "only_me";
  is_pinned: boolean;
  is_hidden: boolean;
  is_archived: boolean;
  is_draft: boolean;
  is_scheduled: boolean;
  scheduled_at: string | null;
  shared_post_id: string | null;
  quote_text: string | null;
  cross_posted_from: string | null;
  repost_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  trending_score: number;
  author: PostAuthor | null;
  shared_post: Post | null;
  poll: Poll | null;
  is_liked: boolean;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
}

export type PostType = "text" | "image" | "video" | "audio" | "gif" | "poll" | "document" | "shared" | "quote";

export interface PostCreate {
  content?: string;
  image_urls?: string[];
  video_url?: string;
  audio_url?: string;
  gif_url?: string;
  document_url?: string;
  document_name?: string;
  location_name?: string;
  location_lat?: number;
  location_lng?: number;
  feeling_type?: string;
  feeling_text?: string;
  background_style?: string;
  background_image_url?: string;
  aspect_ratio?: string;
  post_type?: PostType;
  privacy?: "everyone" | "friends" | "close_friends" | "followers" | "friends_followers" | "only_me";
  is_draft?: boolean;
  is_scheduled?: boolean;
  scheduled_at?: string;
  shared_post_id?: string;
  quote_text?: string;
  cross_posted_from?: string;
  poll?: PollCreate;
  hashtags?: string[];
}

export interface PostUpdate {
  content?: string;
  image_urls?: string[];
  video_url?: string;
  audio_url?: string;
  gif_url?: string;
  document_url?: string;
  document_name?: string;
  location_name?: string;
  location_lat?: number;
  location_lng?: number;
  feeling_type?: string;
  feeling_text?: string;
  background_style?: string;
  background_image_url?: string;
  aspect_ratio?: string;
  privacy?: "everyone" | "friends" | "close_friends" | "followers" | "friends_followers" | "only_me";
  is_archived?: boolean;
  is_draft?: boolean;
  scheduled_at?: string;
  quote_text?: string;
}

export interface FeedResponse {
  posts: Post[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface FeedPosition {
  user_id: string;
  feed_type: string;
  last_post_id: string | null;
  scroll_position: number;
  updated_at: string;
}

export interface FeedPositionUpdate {
  feed_type: string;
  last_post_id?: string;
  scroll_position?: number;
}

export type FeedType = "home" | "following" | "friends" | "trending" | "suggested";

export type FeedSortBy = "latest" | "trending" | "popular";

export interface FeedFilters {
  feed_type: FeedType;
  sort_by: FeedSortBy;
  privacy_filter?: "everyone" | "friends" | "close_friends" | "followers" | "friends_followers" | "only_me";
}

export const POST_TYPES = [
  { value: "text", label: "Text", icon: "Type" },
  { value: "image", label: "Photo", icon: "Image" },
  { value: "video", label: "Video", icon: "Video" },
  { value: "poll", label: "Poll", icon: "BarChart3" },
] as const;

export const FEELING_TYPES = [
  { value: "happy", label: "Happy", emoji: "😊" },
  { value: "sad", label: "Sad", emoji: "😢" },
  { value: "excited", label: "Excited", emoji: "🎉" },
  { value: "angry", label: "Angry", emoji: "😠" },
  { value: "love", label: "In Love", emoji: "❤️" },
  { value: "grateful", label: "Grateful", emoji: "🙏" },
  { value: "tired", label: "Tired", emoji: "😴" },
  { value: "blessed", label: "Blessed", emoji: "✨" },
  { value: "thinking", label: "Thinking", emoji: "🤔" },
  { value: "celebrating", label: "Celebrating", emoji: "🥳" },
] as const;

export const FEED_TABS = [
  { key: "home", label: "Home" },
  { key: "following", label: "Following" },
  { key: "friends", label: "Friends" },
  { key: "trending", label: "Trending" },
  { key: "suggested", label: "For You" },
] as const;

export const FEED_SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "trending", label: "Trending" },
  { value: "popular", label: "Popular" },
] as const;

export const POST_VISIBILITY_OPTIONS = [
  { value: "everyone", label: "Everyone" },
  { value: "friends", label: "Friends" },
  { value: "close_friends", label: "Close Friends" },
  { value: "followers", label: "Followers" },
  { value: "friends_followers", label: "Friends & Followers" },
  { value: "only_me", label: "Only Me" },
] as const;
