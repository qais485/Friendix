export interface Hashtag {
  id: string;
  name: string;
  posts_count: number;
  followers_count: number;
  description: string | null;
  created_at: string;
  is_following: boolean;
}

export interface HashtagDetail {
  id: string;
  name: string;
  posts_count: number;
  followers_count: number;
  description: string | null;
  is_following: boolean;
  created_at: string;
}

export interface TrendingHashtag {
  id: string;
  name: string;
  posts_count: number;
  followers_count: number;
  description: string | null;
  is_following: boolean;
}

export interface HashtagPost {
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

export interface TrendingHashtagsResponse {
  hashtags: TrendingHashtag[];
}

export interface HashtagListResponse {
  hashtags: Hashtag[];
}

export interface HashtagPostsResponse {
  posts: HashtagPost[];
  total_count: number;
}

export interface FollowResponse {
  message: string;
  hashtag_id: string;
  is_following: boolean;
}
