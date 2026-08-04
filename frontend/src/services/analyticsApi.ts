import api from "./api";
import type {
  AnalyticsOverview,
  ProfileViewSummary,
  PostAnalytics,
  EngagementData,
  FollowersGrowthSummary,
  StoryAnalyticsSummary,
  ReelAnalyticsSummary,
  VideoAnalyticsSummary,
} from '../types/analytics';

const analyticsApi = {
  getOverview: () => api.get<AnalyticsOverview>('/analytics/overview').then(r => r.data),
  getProfileViews: (days = 30) => api.get<ProfileViewSummary>('/analytics/profile-views', { params: { days } }).then(r => r.data),
  getPostAnalytics: (days = 30) => api.get<PostAnalytics>('/analytics/posts', { params: { days } }).then(r => r.data),
  getEngagement: (days = 30) => api.get<EngagementData>('/analytics/engagement', { params: { days } }).then(r => r.data),
  getFollowersGrowth: (days = 30) => api.get<FollowersGrowthSummary>('/analytics/followers-growth', { params: { days } }).then(r => r.data),
  getStoryAnalytics: (days = 30) => api.get<StoryAnalyticsSummary>('/analytics/stories', { params: { days } }).then(r => r.data),
  getReelAnalytics: (days = 30) => api.get<ReelAnalyticsSummary>('/analytics/reels', { params: { days } }).then(r => r.data),
  getVideoAnalytics: (days = 30) => api.get<VideoAnalyticsSummary>('/analytics/videos', { params: { days } }).then(r => r.data),
};

export default analyticsApi;
