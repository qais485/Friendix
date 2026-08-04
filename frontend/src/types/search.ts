export interface SearchResultUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  bio: string | null;
}

export interface SearchResultPost {
  id: string;
  content: string | null;
  user_id: string;
  username: string | null;
  user_avatar: string | null;
  post_type: string;
  image_urls: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface SearchResultReel {
  id: string;
  description: string | null;
  video_url: string | null;
  user_id: string;
  username: string | null;
  user_avatar: string | null;
  created_at: string;
}

export interface SearchResultComment {
  id: string;
  content: string | null;
  post_id: string;
  user_id: string;
  username: string | null;
  created_at: string;
}

export interface SearchResultLive {
  id: string;
  title: string | null;
  user_id: string;
  username: string | null;
  user_avatar: string | null;
  is_live: boolean;
  created_at: string;
}

export interface UnifiedSearchResponse {
  users: SearchResultUser[];
  posts: SearchResultPost[];
  reels: SearchResultReel[];
  comments: SearchResultComment[];
  lives: SearchResultLive[];
  total_count: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  search_type: string;
  results_count: number;
  created_at: string;
}

export interface SearchHistoryListResponse {
  history: SearchHistoryItem[];
}

export interface SavedSearchItem {
  id: string;
  query: string;
  search_type: string;
  filters_json: string | null;
  label: string | null;
  created_at: string;
}

export interface SavedSearchListResponse {
  saved_searches: SavedSearchItem[];
}

export type SearchType = "all" | "users" | "posts" | "reels" | "comments" | "lives";

export interface SearchFilters {
  post_type?: string;
  date_from?: string;
  date_to?: string;
}
