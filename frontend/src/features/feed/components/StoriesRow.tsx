import { useState, useMemo } from "react";
import { Plus, Camera } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

import { useActiveStories } from "@/features/media/hooks";
import { useFriends } from "@/features/friends/hooks";
import { StoryViewer } from "@/features/media/components/StoryViewer";
import { StoryCreator } from "@/features/media/components/StoryCreator";
import { MusicStoryCreator } from "@/features/media/components/MusicStoryCreator";
import { useUploadToMedia } from "../hooks";
import type { Media, Story } from "@/types";

/** Segmented status ring around a profile picture, one segment per story. */
function SegmentedRing({
  count,
  hasUnread,
  size = 68,
  stroke = 3,
}: {
  count: number;
  hasUnread: boolean;
  size?: number;
  stroke?: number;
}) {
  if (count <= 0) return null;
  const radius = (size - stroke) / 2;
  const color = hasUnread ? "#25D366" : "rgba(255,255,255,0.4)";
  const segments = Array.from({ length: count }, (_, i) => {
    const gap = 0.06;
    const start = (i / count) * Math.PI * 2 - Math.PI / 2 + gap;
    const end = ((i + 1) / count) * Math.PI * 2 - Math.PI / 2 - gap;
    return { start, end };
  });
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0 h-full w-full"
    >
      {segments.map(({ start, end }, i) => {
        const largeArc = end - start > Math.PI ? 1 : 0;
        const x0 = size / 2 + radius * Math.cos(start);
        const y0 = size / 2 + radius * Math.sin(start);
        const x1 = size / 2 + radius * Math.cos(end);
        const y1 = size / 2 + radius * Math.sin(end);
        return (
          <path
            key={i}
            d={`M ${x0} ${y0} A ${radius} ${radius} 0 ${largeArc} 1 ${x1} ${y1}`}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/** My Status card with profile picture and + button overlay. */
function MyStatusCard({
  user,
  myStories,
  onCreateStory,
}: {
  user: { avatar_url?: string | null; full_name?: string | null } | null;
  myStories: Story[];
  onCreateStory: () => void;
}) {
  const hasStories = myStories.length > 0;
  const hasUnread = false; // My own stories are always "viewed" by me

  return (
    <button
      onClick={onCreateStory}
      className="flex w-[100px] flex-shrink-0 snap-start flex-col items-center gap-2 text-left group"
      aria-label="Create new status"
    >
      <div className="relative h-[68px] w-[68px]">
        {/* Segmented ring around my status if I have stories */}
        {hasStories && (
          <SegmentedRing
            count={myStories.length}
            hasUnread={hasUnread}
            size={68}
            stroke={3}
          />
        )}
        {/* Profile picture */}
        <div className="absolute inset-[4px] overflow-hidden rounded-full bg-neutral-800">
          {user?.avatar_url ? (
            <OptimizedImage
              src={user.avatar_url}
              alt="My status"
              preset="avatar"
              eager
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/80 text-lg font-semibold text-white">
              {(user?.full_name || "U")[0].toUpperCase()}
            </div>
          )}
        </div>
        {/* Plus button overlay */}
        <div className="absolute -bottom-0.5 -right-0.5 z-10 flex h-[24px] w-[24px] items-center justify-center rounded-full border-[2.5px] border-background bg-[#25D366] shadow-md transition-transform group-hover:scale-110">
          <Plus className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        </div>
      </div>
      <span className="w-full truncate text-center text-[11px] font-medium text-foreground">
        My Status
      </span>
    </button>
  );
}

/** Story preview card for another user. */
function StoryCard({
  group,
  onClick,
}: {
  group: Story[];
  onClick: () => void;
}) {
  const first = group[0]!;
  const author = first.user;
  const hasUnread = group.some((s) => !s.viewed);

  return (
    <button
      onClick={onClick}
      className="flex w-[100px] flex-shrink-0 snap-start flex-col items-center gap-2 text-left group"
      aria-label={`Status from ${author?.full_name || "user"}`}
    >
      <div className="relative h-[68px] w-[68px]">
        {/* Segmented ring */}
        <SegmentedRing
          count={group.length}
          hasUnread={hasUnread}
          size={68}
          stroke={3}
        />
        {/* Profile picture */}
        <div className="absolute inset-[4px] overflow-hidden rounded-full bg-neutral-800">
          {author?.avatar_url ? (
            <OptimizedImage
              src={author.avatar_url}
              alt={author?.full_name || "User"}
              preset="avatar"
              eager
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/80 text-lg font-semibold text-white">
              {(author?.full_name || "U")[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <span className="w-full truncate text-center text-[11px] font-medium text-foreground">
        {author?.full_name?.split(" ")[0] || "Unknown"}
      </span>
    </button>
  );
}

export function StoriesRow() {
  const { user } = useAuthStore();
  const userId = user?.id || "";
  const { data: friends = [] } = useFriends(userId || undefined);
  const friendUserIds = friends.map((f) => f.id);
  const allUserIds = userId ? [userId, ...friendUserIds].join(",") : undefined;
  const { data: stories = [] } = useActiveStories(allUserIds || "");
  const [viewingStories, setViewingStories] = useState<{
    stories: Story[];
    index: number;
  } | null>(null);
  const [storyCreatorOpen, setStoryCreatorOpen] = useState(false);
  const [musicStoryOpen, setMusicStoryOpen] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<Media | null>(null);
  const { upload, isUploading } = useUploadToMedia();

  const handleStoryUpload = async (files: File[]) => {
    const media = await upload(files);
    if (media[0]) setUploadedMedia(media[0]);
  };

  // Group stories by author (one card per user), ordered oldest-first within each group.
  const { myStories, recentGroups, viewedGroups } = useMemo(() => {
    const groupMap = new Map<string, Story[]>();
    for (const story of stories) {
      const list = groupMap.get(story.user_id) || [];
      list.push(story);
      groupMap.set(story.user_id, list);
    }

    const myStoryList: Story[] = [];
    const allGroups: Story[][] = [];

    for (const [authorId, list] of groupMap) {
      // Sort stories within group oldest-first
      list.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      if (authorId === userId) {
        myStoryList.push(...list);
      } else {
        allGroups.push(list);
      }
    }

    // Separate into recent (unseen) and viewed groups
    const recent: Story[][] = [];
    const viewed: Story[][] = [];

    for (const group of allGroups) {
      const hasUnseen = group.some((s) => !s.viewed);
      if (hasUnseen) {
        recent.push(group);
      } else {
        viewed.push(group);
      }
    }

    // Sort recent by newest story first
    recent.sort((a, b) => {
      const lastA = a[a.length - 1]!.created_at;
      const lastB = b[b.length - 1]!.created_at;
      return new Date(lastB).getTime() - new Date(lastA).getTime();
    });

    // Sort viewed by newest story first
    viewed.sort((a, b) => {
      const lastA = a[a.length - 1]!.created_at;
      const lastB = b[b.length - 1]!.created_at;
      return new Date(lastB).getTime() - new Date(lastA).getTime();
    });

    return { myStories: myStoryList, recentGroups: recent, viewedGroups: viewed };
  }, [stories, userId]);

  // Flatten for the viewer: all stories in viewing order (recent then viewed)
  const flatStories = useMemo(() => {
    const orderedGroups = [...recentGroups, ...viewedGroups];
    return orderedGroups.flat();
  }, [recentGroups, viewedGroups]);

  const openGroup = (group: Story[]) => {
    const groupStart = flatStories.findIndex((s) => s.id === group[0]!.id);
    const unreadIndex = group.findIndex((s) => !s.viewed);
    const startIndex = unreadIndex >= 0 ? unreadIndex : 0;
    setViewingStories({ stories: flatStories, index: groupStart + startIndex });
  };

  const openMyStatus = () => {
    if (myStories.length > 0) {
      // If I have stories, open them in the viewer
      setViewingStories({ stories: myStories, index: 0 });
    } else {
      // Otherwise open story creator
      setStoryCreatorOpen(true);
    }
  };

  return (
    <>
      <div className="rounded-2xl glass-card p-4">
        {/* My Status Section */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Status</h3>
            {myStories.length > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {myStories.length} {myStories.length === 1 ? "update" : "updates"}
              </span>
            )}
          </div>
        </div>

        {/* Horizontal scrollable tray */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {/* My Status - always first */}
          <MyStatusCard
            user={user}
            myStories={myStories}
            onCreateStory={openMyStatus}
          />

          {/* Recent Updates - unseen stories */}
          {recentGroups.map((group) => {
            const firstStory = group[0]!;
            return (
              <StoryCard
                key={firstStory.user_id}
                group={group}
                onClick={() => openGroup(group)}
              />
            );
          })}

          {/* Viewed Updates - all seen */}
          {viewedGroups.map((group) => {
            const firstStory = group[0]!;
            return (
              <StoryCard
                key={firstStory.user_id}
                group={group}
                onClick={() => openGroup(group)}
              />
            );
          })}
        </div>

        {/* Section labels below the tray */}
        {(recentGroups.length > 0 || viewedGroups.length > 0) && (
          <div className="mt-3 flex gap-4 overflow-x-auto scrollbar-hide">
            {recentGroups.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                  Recent Updates
                </span>
              </div>
            )}
            {viewedGroups.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                  Viewed Updates
                </span>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {recentGroups.length === 0 && viewedGroups.length === 0 && myStories.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <Camera className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">
              No recent updates. Share your first status!
            </p>
          </div>
        )}
      </div>

      {viewingStories && (
        <StoryViewer
          stories={viewingStories.stories}
          userId={userId}
          initialIndex={viewingStories.index}
          onClose={() => setViewingStories(null)}
        />
      )}

      <AnimatePresence>
        {storyCreatorOpen && (
          <StoryCreator
            userId={userId}
            onClose={() => {
              setStoryCreatorOpen(false);
              setUploadedMedia(null);
            }}
            onUpload={handleStoryUpload}
            isUploading={isUploading}
            uploadedMedia={uploadedMedia || undefined}
            onOpenMusicStory={() => {
              setStoryCreatorOpen(false);
              setMusicStoryOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {musicStoryOpen && (
          <MusicStoryCreator
            userId={userId}
            onClose={() => setMusicStoryOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
