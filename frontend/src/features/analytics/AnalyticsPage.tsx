import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, FileText, Users, Heart, BookOpen, Clapperboard, Film, TrendingUp, UserPlus } from 'lucide-react';
import { useAnalyticsOverview, useProfileViews, usePostAnalytics, useEngagement, useFollowersGrowth, useStoryAnalytics, useReelAnalytics, useVideoAnalytics } from './hooks';
import { AnalyticsCardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { getCloudinaryTransformedUrl } from '@/lib/cloudinaryTransform';
import type { AnalyticsOverview, ProfileViewSummary, PostAnalytics, EngagementData, FollowersGrowthSummary, StoryAnalyticsSummary, ReelAnalyticsSummary, VideoAnalyticsSummary } from '../../types/analytics';

const tabs = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'profile-views', label: 'Profile Views', icon: Eye },
  { id: 'posts', label: 'Post Reach', icon: FileText },
  { id: 'engagement', label: 'Engagement', icon: Heart },
  { id: 'followers', label: 'Followers Growth', icon: Users },
  { id: 'stories', label: 'Story Analytics', icon: BookOpen },
  { id: 'reels', label: 'Reel Analytics', icon: Clapperboard },
  { id: 'videos', label: 'Video Analytics', icon: Film },
] as const;

type Tab = (typeof tabs)[number]['id'];

const periodOptions = [
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
  { value: 365, label: '1 Year' },
];

const StatCard = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }> }) => (
  <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-bold text-muted-foreground">{label}</span>
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-purple-500/15">
        <Icon className="w-4 h-4 text-primary" />
      </div>
    </div>
    <p className="text-2xl font-black text-foreground tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p>
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MiniBarChart = ({ data, valueKey, color = 'bg-primary' }: { data: any[]; valueKey: string; color?: string }) => {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => {
        const h = (Number(d[valueKey]) / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full ${color} rounded-t-sm transition-all duration-300`}
              style={{ height: `${Math.max(h, 2)}%` }}
            />
          </div>
        );
      })}
    </div>
  );
};

function TabSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <AnalyticsCardSkeleton key={i} />
      ))}
    </div>
  );
}

function OverviewTab({ data }: { data: AnalyticsOverview }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard label="Total Posts" value={data.total_posts} icon={FileText} />
      <StatCard label="Followers" value={data.total_followers} icon={UserPlus} />
      <StatCard label="Profile Views" value={data.total_profile_views} icon={Eye} />
      <StatCard label="Reels" value={data.total_reels} icon={Clapperboard} />
      <StatCard label="Videos" value={data.total_videos} icon={Film} />
    </div>
  );
}

function ProfileViewsTab({ data }: { data: ProfileViewSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Profile Views" value={data.total} icon={Eye} />
      </div>
      {data.time_series.length > 0 && (
        <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-elevated">
          <h4 className="text-sm font-bold text-muted-foreground mb-3">Views Over Time</h4>
          <MiniBarChart data={data.time_series} valueKey="count" color="bg-primary" />
          <div className="flex justify-between mt-3 text-xs text-muted-foreground">
            {data.time_series.filter((_, i) => i % Math.max(Math.floor(data.time_series.length / 6), 1) === 0 || i === data.time_series.length - 1).map((d) => (
              <span key={d.date}>{d.date.slice(5)}</span>
            ))}
          </div>
        </div>
      )}
      {data.top_viewers.length > 0 && (
        <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-elevated">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Top Viewers</h4>
          <div className="space-y-2">
            {data.top_viewers.map((v) => (
              <div key={v.user_id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <img
                    src={getCloudinaryTransformedUrl(v.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.username}`, "avatar")}
                    alt=""
                    width={36}
                    height={36}
                    loading="lazy"
                    decoding="async"
                    className="w-9 h-9 rounded-full ring-2 ring-border"
                  />
                  <span className="text-sm font-medium text-foreground">{v.full_name || v.username}</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">{v.views} views</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PostReachTab({ data }: { data: PostAnalytics }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard label="Posts" value={data.total_posts} icon={FileText} />
        <StatCard label="Likes" value={data.total_likes} icon={Heart} />
        <StatCard label="Comments" value={data.total_comments} icon={FileText} />
        <StatCard label="Engagement Rate" value={`${data.engagement_rate}%`} icon={TrendingUp} />
      </div>
      {data.time_series.length > 0 && (
        <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-elevated">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Posts Over Time</h4>
          <MiniBarChart data={data.time_series} valueKey="count" color="bg-primary" />
        </div>
      )}
      {data.top_posts.length > 0 && (
        <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-elevated">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Top Posts</h4>
          <div className="space-y-2">
            {data.top_posts.map((p) => (
              <div key={p.id} className="p-4 rounded-xl hover:bg-muted/50 transition-all duration-200">
                <p className="text-sm text-foreground line-clamp-2">{p.content}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{p.likes_count} likes</span>
                  <span>{p.comments_count} comments</span>
                  <span>{p.shares_count} shares</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EngagementTab({ data }: { data: EngagementData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Content" value={data.total_content} icon={FileText} />
        <StatCard label="Total Interactions" value={data.total_interactions} icon={Heart} />
        <StatCard label="Avg Engagement Rate" value={`${data.avg_engagement_rate}%`} icon={TrendingUp} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Posts</h4>
          <p className="text-xl font-bold text-foreground">{data.posts.total_posts}</p>
          <p className="text-xs text-muted-foreground mt-1">{data.posts.total_engagement} interactions</p>
        </div>
        <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Stories</h4>
          <p className="text-xl font-bold text-foreground">{data.stories.total_stories}</p>
          <p className="text-xs text-muted-foreground mt-1">{data.stories.total_views} views</p>
        </div>
        <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Reels</h4>
          <p className="text-xl font-bold text-foreground">{data.reels.total_reels}</p>
          <p className="text-xs text-muted-foreground mt-1">{data.reels.total_views} views</p>
        </div>
        <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Videos</h4>
          <p className="text-xl font-bold text-foreground">{data.videos.total_videos}</p>
          <p className="text-xs text-muted-foreground mt-1">{data.videos.total_views} views</p>
        </div>
      </div>
    </div>
  );
}

function FollowersGrowthTab({ data }: { data: FollowersGrowthSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Followers" value={data.total_followers} icon={UserPlus} />
        <StatCard label="Following" value={data.total_following} icon={Users} />
        <StatCard label="New Followers" value={`+${data.new_followers}`} icon={TrendingUp} />
        <StatCard label="New Following" value={`+${data.new_following}`} icon={TrendingUp} />
      </div>
      {data.time_series.length > 0 && (
        <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-elevated">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">New Followers Over Time</h4>
          <MiniBarChart data={data.time_series} valueKey="count" color="bg-primary" />
          <div className="flex justify-between mt-3 text-xs text-muted-foreground">
            {data.time_series.filter((_, i) => i % Math.max(Math.floor(data.time_series.length / 6), 1) === 0 || i === data.time_series.length - 1).map((d) => (
              <span key={d.date}>{d.date.slice(5)}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StoryAnalyticsTab({ data }: { data: StoryAnalyticsSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Stories" value={data.total_stories} icon={BookOpen} />
        <StatCard label="Views" value={data.total_views} icon={Eye} />
        <StatCard label="Reactions" value={data.total_reactions} icon={Heart} />
        <StatCard label="Avg Views" value={data.avg_views_per_story} icon={TrendingUp} />
      </div>
      {data.time_series.length > 0 && (
        <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-elevated">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Stories Over Time</h4>
          <MiniBarChart data={data.time_series} valueKey="count" color="bg-primary" />
        </div>
      )}
    </div>
  );
}

function ReelAnalyticsTab({ data }: { data: ReelAnalyticsSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Reels" value={data.total_reels} icon={Clapperboard} />
        <StatCard label="Views" value={data.total_views} icon={Eye} />
        <StatCard label="Likes" value={data.total_likes} icon={Heart} />
        <StatCard label="Avg Views" value={data.avg_views_per_reel} icon={TrendingUp} />
      </div>
      {data.time_series.length > 0 && (
        <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-elevated">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Reels Over Time</h4>
          <MiniBarChart data={data.time_series} valueKey="views" color="bg-primary" />
        </div>
      )}
      {data.top_reels.length > 0 && (
        <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-elevated">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Top Reels</h4>
          <div className="space-y-2">
            {data.top_reels.map((r) => (
              <div key={r.id} className="p-4 rounded-xl hover:bg-muted/50 transition-all duration-200">
                <p className="text-sm text-foreground line-clamp-2">{r.caption}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{r.views_count} views</span>
                  <span>{r.likes_count} likes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VideoAnalyticsTab({ data }: { data: VideoAnalyticsSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Videos" value={data.total_videos} icon={Film} />
        <StatCard label="Views" value={data.total_views} icon={Eye} />
        <StatCard label="Likes" value={data.total_likes} icon={Heart} />
        <StatCard label="Avg Views" value={data.avg_views_per_video} icon={TrendingUp} />
      </div>
      {data.time_series.length > 0 && (
        <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-elevated">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Videos Over Time</h4>
          <MiniBarChart data={data.time_series} valueKey="views" color="bg-primary" />
        </div>
      )}
      {data.top_videos.length > 0 && (
        <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-elevated">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Top Videos</h4>
          <div className="space-y-2">
            {data.top_videos.map((v) => (
              <div key={v.id} className="p-4 rounded-xl hover:bg-muted/50 transition-all duration-200">
                <p className="text-sm font-medium text-foreground">{v.title}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{v.views_count} views</span>
                  <span>{v.likes_count} likes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [period, setPeriod] = useState(30);

  const overview = useAnalyticsOverview();
  const profileViews = useProfileViews(period);
  const postAnalytics = usePostAnalytics(period);
  const engagement = useEngagement(period);
  const followersGrowth = useFollowersGrowth(period);
  const storyAnalytics = useStoryAnalytics(period);
  const reelAnalytics = useReelAnalytics(period);
  const videoAnalytics = useVideoAnalytics(period);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        if (overview.isLoading) return <TabSkeleton />;
        if (overview.error) return <ErrorState title="Failed to load overview" onRetry={() => overview.refetch()} />;
        return overview.data ? <OverviewTab data={overview.data} /> : null;
      case 'profile-views':
        if (profileViews.isLoading) return <TabSkeleton />;
        if (profileViews.error) return <ErrorState title="Failed to load profile views" onRetry={() => profileViews.refetch()} />;
        return profileViews.data ? <ProfileViewsTab data={profileViews.data} /> : null;
      case 'posts':
        if (postAnalytics.isLoading) return <TabSkeleton />;
        if (postAnalytics.error) return <ErrorState title="Failed to load post analytics" onRetry={() => postAnalytics.refetch()} />;
        return postAnalytics.data ? <PostReachTab data={postAnalytics.data} /> : null;
      case 'engagement':
        if (engagement.isLoading) return <TabSkeleton />;
        if (engagement.error) return <ErrorState title="Failed to load engagement data" onRetry={() => engagement.refetch()} />;
        return engagement.data ? <EngagementTab data={engagement.data} /> : null;
      case 'followers':
        if (followersGrowth.isLoading) return <TabSkeleton />;
        if (followersGrowth.error) return <ErrorState title="Failed to load followers growth" onRetry={() => followersGrowth.refetch()} />;
        return followersGrowth.data ? <FollowersGrowthTab data={followersGrowth.data} /> : null;
      case 'stories':
        if (storyAnalytics.isLoading) return <TabSkeleton />;
        if (storyAnalytics.error) return <ErrorState title="Failed to load story analytics" onRetry={() => storyAnalytics.refetch()} />;
        return storyAnalytics.data ? <StoryAnalyticsTab data={storyAnalytics.data} /> : null;
      case 'reels':
        if (reelAnalytics.isLoading) return <TabSkeleton />;
        if (reelAnalytics.error) return <ErrorState title="Failed to load reel analytics" onRetry={() => reelAnalytics.refetch()} />;
        return reelAnalytics.data ? <ReelAnalyticsTab data={reelAnalytics.data} /> : null;
      case 'videos':
        if (videoAnalytics.isLoading) return <TabSkeleton />;
        if (videoAnalytics.error) return <ErrorState title="Failed to load video analytics" onRetry={() => videoAnalytics.refetch()} />;
        return videoAnalytics.data ? <VideoAnalyticsTab data={videoAnalytics.data} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div className="flex items-center justify-between pt-12 md:pt-0">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gradient">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track your content performance</p>
        </div>
        <div>
          <label htmlFor="analytics-period" className="sr-only">Time period</label>
          <select
            id="analytics-period"
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="px-4 py-2.5 border border-border/60 rounded-full text-sm glass-card text-foreground transition-all duration-200 hover:shadow-elevated focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
          >
            {periodOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div role="tablist" aria-label="Analytics tabs" className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={activeTab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-primary to-purple-500 text-primary-foreground shadow-glow'
                : 'glass-card text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:backdrop-blur-sm'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {renderTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
