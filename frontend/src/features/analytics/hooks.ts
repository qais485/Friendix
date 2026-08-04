import { useQuery } from '@tanstack/react-query';
import analyticsApi from '../../services/analyticsApi';

export const useAnalyticsOverview = () =>
  useQuery({ queryKey: ['analytics', 'overview'], queryFn: analyticsApi.getOverview });

export const useProfileViews = (days = 30) =>
  useQuery({ queryKey: ['analytics', 'profile-views', days], queryFn: () => analyticsApi.getProfileViews(days) });

export const usePostAnalytics = (days = 30) =>
  useQuery({ queryKey: ['analytics', 'posts', days], queryFn: () => analyticsApi.getPostAnalytics(days) });

export const useEngagement = (days = 30) =>
  useQuery({ queryKey: ['analytics', 'engagement', days], queryFn: () => analyticsApi.getEngagement(days) });

export const useFollowersGrowth = (days = 30) =>
  useQuery({ queryKey: ['analytics', 'followers-growth', days], queryFn: () => analyticsApi.getFollowersGrowth(days) });

export const useStoryAnalytics = (days = 30) =>
  useQuery({ queryKey: ['analytics', 'stories', days], queryFn: () => analyticsApi.getStoryAnalytics(days) });

export const useReelAnalytics = (days = 30) =>
  useQuery({ queryKey: ['analytics', 'reels', days], queryFn: () => analyticsApi.getReelAnalytics(days) });

export const useVideoAnalytics = (days = 30) =>
  useQuery({ queryKey: ['analytics', 'videos', days], queryFn: () => analyticsApi.getVideoAnalytics(days) });
