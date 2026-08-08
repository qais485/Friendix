import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Users, UserPlus, Clock, Heart, Star } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  useFriends,
  usePendingSent,
  usePendingReceived,
  useFriendSuggestions,
  useFriendCounts,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useCancelFriendRequest,
  useRemoveFriend,
  useFollow,
  useUnfollow,
  useFollowers,
  useFollowing,
  useUpdateFavorite,
  useCloseFriends,
  useAddCloseFriend,
  useRemoveCloseFriend,
} from "./hooks";
import {
  FriendRequestCard,
  FriendList,
  FriendSuggestions,
  FollowList,
} from "./components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FriendsTab } from "@/types";

export function FriendsPage() {
  const { user } = useAuthStore();
  const userId = user?.id || "";

  const [activeTab, setActiveTab] = useState<FriendsTab>("all");

  const { data: friends = [], isLoading: friendsLoading } = useFriends(userId || undefined);
  const { data: pendingSent = [] } = usePendingSent(userId || undefined);
  const { data: pendingReceived = [] } = usePendingReceived(userId || undefined);
  const { data: suggestions = [], isLoading: suggestionsLoading } = useFriendSuggestions(userId || undefined);
  const { data: counts } = useFriendCounts(userId || undefined);
  const { data: followers = [], isLoading: followersLoading } = useFollowers(userId || undefined);
  const { data: following = [], isLoading: followingLoading } = useFollowing(userId || undefined);
  const { data: closeFriends = [], isLoading: closeFriendsLoading } = useCloseFriends(userId || undefined);

  const sendRequest = useSendFriendRequest(userId);
  const acceptRequest = useAcceptFriendRequest(userId);
  const rejectRequest = useRejectFriendRequest(userId);
  const cancelRequest = useCancelFriendRequest(userId);
  const removeFriend = useRemoveFriend(userId);
  const follow = useFollow(userId);
  const unfollow = useUnfollow(userId);
  const updateFavorite = useUpdateFavorite(userId);
  const addCloseFriend = useAddCloseFriend(userId);
  const removeCloseFriend = useRemoveCloseFriend(userId);

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tabs = [
    { key: "all", label: "Friends", icon: <Users className="h-4 w-4" />, count: counts?.friends },
    { key: "suggestions", label: "Suggestions", icon: <UserPlus className="h-4 w-4" />, count: suggestions.length },
    { key: "pending", label: "Requests", icon: <Clock className="h-4 w-4" />, count: pendingReceived.length },
    { key: "followers", label: "Followers", icon: <Heart className="h-4 w-4" />, count: counts?.followers },
    { key: "following", label: "Following", icon: <Star className="h-4 w-4" />, count: counts?.following },
    { key: "close", label: "Close Friends", icon: <Star className="h-4 w-4" />, count: counts?.close_friends },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="pt-12 md:pt-0">
            <h1 className="text-2xl font-black tracking-tight text-gradient">Friends</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your friends, followers, and close friends.
            </p>
          </div>

          <div role="tablist" aria-label="Friends sections" className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls={`friends-panel-${tab.key}`}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.key as FriendsTab)}
                className={cn(
                  "gap-1.5 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-all duration-200",
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-primary to-purple-500 text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:bg-muted/60 hover:backdrop-blur-sm"
                )}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold">
                    {tab.count}
                  </span>
                )}
              </Button>
            ))}
          </div>

          {activeTab === "all" && (
            <FriendList
              friends={friends}
              isLoading={friendsLoading}
              onRemove={(friendId: string) => removeFriend.mutate(friendId)}
              onToggleFavorite={(friendId: string) => {
                const friend = friends.find((f) => f.id === friendId);
                updateFavorite.mutate({ friendId, data: { is_favorite: !(friend as { is_favorite?: boolean })?.is_favorite } });
              }}
              onToggleCloseFriend={(friendId: string, isCloseFriend: boolean) => {
                if (isCloseFriend) {
                  removeCloseFriend.mutate(friendId);
                } else {
                  addCloseFriend.mutate(friendId);
                }
              }}
              isProcessing={removeFriend.isPending}
            />
          )}

          {activeTab === "suggestions" && (
            <FriendSuggestions
              suggestions={suggestions}
              isLoading={suggestionsLoading}
              onAddFriend={(userId: string) => sendRequest.mutate(userId)}
              isProcessing={sendRequest.isPending}
            />
          )}

          {activeTab === "pending" && (
            <div className="space-y-6">
              {pendingReceived.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">Received Requests</h3>
                  {pendingReceived.map((request) => (
                    <FriendRequestCard
                      key={request.id}
                      user={request}
                      type="received"
                      onAccept={() => acceptRequest.mutate(request.friendship_id!)}
                      onReject={() => rejectRequest.mutate(request.friendship_id!)}
                      isProcessing={acceptRequest.isPending || rejectRequest.isPending}
                    />
                  ))}
                </div>
              )}

              {pendingSent.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">Sent Requests</h3>
                  {pendingSent.map((request) => (
                    <FriendRequestCard
                      key={request.id}
                      user={request}
                      type="sent"
                      onCancel={() => cancelRequest.mutate(request.friendship_id!)}
                      isProcessing={cancelRequest.isPending}
                    />
                  ))}
                </div>
              )}

              {pendingReceived.length === 0 && pendingSent.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-3xl glass-card border border-dashed py-16 text-center">
                  <Clock className="h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-4 font-semibold">No pending requests</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "followers" && (
            <FollowList
              users={followers}
              isLoading={followersLoading}
              type="followers"
              onFollow={(userId: string) => follow.mutate(userId)}
              isProcessing={follow.isPending}
            />
          )}

          {activeTab === "following" && (
            <FollowList
              users={following}
              isLoading={followingLoading}
              type="following"
              onUnfollow={(userId: string) => unfollow.mutate(userId)}
              isProcessing={unfollow.isPending}
            />
          )}

          {activeTab === "close" && (
            <div className="space-y-4">
              <div className="rounded-2xl glass-card p-4 sm:p-6">
                <h3 className="text-lg font-bold">Close Friends</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  These friends can see your close-friends-only stories and content.
                  Only accepted friends can be added to this list.
                </p>
              </div>
              <FriendList
                friends={closeFriends.map((cf) => ({
                  id: cf.id,
                  full_name: cf.full_name,
                  username: cf.username,
                  avatar_url: cf.avatar_url,
                  bio: cf.bio,
                  is_verified: cf.is_verified,
                  mutual_friends_count: 0,
                  is_close_friend: true,
                  friendship_id: "",
                }))}
                isLoading={closeFriendsLoading}
                onRemove={(friendId: string) => removeFriend.mutate(friendId)}
                onToggleCloseFriend={(friendId: string) => {
                  removeCloseFriend.mutate(friendId);
                }}
                showFavoriteButton={false}
                isProcessing={removeFriend.isPending}
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
