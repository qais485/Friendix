export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface ProfileViewSummary {
  total: number;
  time_series: TimeSeriesPoint[];
  top_viewers: ProfileViewer[];
}

export interface ProfileViewer {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  views: number;
  last_viewed: string | null;
}

export interface PostAnalyticsSummary {
  total_posts: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_reposts: number;
  total_engagement: number;
  engagement_rate: number;
}

export interface PostTimeSeriesPoint {
  date: string;
  count: number;
  likes: number;
  comments: number;
}

export interface TopPost {
  id: string;
  content: string;
  post_type: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string | null;
}

export interface PostAnalytics extends PostAnalyticsSummary {
  time_series: PostTimeSeriesPoint[];
  top_posts: TopPost[];
}

export interface EngagementData {
  total_content: number;
  total_interactions: number;
  avg_engagement_rate: number;
  posts: PostAnalyticsSummary;
  stories: { total_stories: number; total_views: number; total_reactions: number; total_replies: number; avg_views_per_story: number };
  reels: { total_reels: number; total_views: number; total_likes: number; total_comments: number; total_shares: number; avg_views_per_reel: number };
  videos: { total_videos: number; total_views: number; total_likes: number; total_comments: number; avg_views_per_video: number };
}

export interface FollowersGrowthSummary {
  total_followers: number;
  total_following: number;
  total_friends: number;
  new_followers: number;
  new_following: number;
  time_series: TimeSeriesPoint[];
}

export interface StoryAnalyticsSummary {
  total_stories: number;
  total_views: number;
  total_reactions: number;
  total_replies: number;
  avg_views_per_story: number;
  time_series: (TimeSeriesPoint & { views: number })[];
}

export interface ReelAnalyticsSummary {
  total_reels: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  avg_views_per_reel: number;
  time_series: (TimeSeriesPoint & { views: number; likes: number })[];
  top_reels: TopReel[];
}

export interface TopReel {
  id: string;
  caption: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string | null;
}

export interface VideoAnalyticsSummary {
  total_videos: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  avg_views_per_video: number;
  time_series: (TimeSeriesPoint & { views: number; likes: number })[];
  top_videos: TopVideo[];
}

export interface TopVideo {
  id: string;
  title: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  duration: number | null;
  created_at: string | null;
}

export interface AnalyticsOverview {
  total_posts: number;
  total_followers: number;
  total_profile_views: number;
  total_reels: number;
  total_videos: number;
}
