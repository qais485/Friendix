import { useEffect, useState, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2,
  Settings,
  QrCode,
  Eye,
  Users,
  FileText,
  UserPlus,
  Bookmark,
  EyeOff,
  Clock,
  FileEdit,
  Ban,
  VolumeX,
  Star,
  BarChart3,
  UserPlus2,
  UserMinus2,
  Heart,
  HeartOff,
  UserCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  useMyProfile,
  usePublicProfile,
  useUpdateProfile,
  useUpdateAvatar,
  useUpdateCoverPhoto,
} from "./hooks";
import {
  ProfileHeader,
  ProfileInfo,
  EditProfileModal,
  ProfileQRCode,
  ProfilePreview,
  UsernameEditor,
  ProfilePostList,
  type PostCardHandlers,
} from "./components";
import { PostModal } from "@/features/feed/components";
import type { Post } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { RelationshipButton } from "@/components/common";
import {
  useFriendCounts,
  useFriends,
  useMutualFriends,
  useFriendshipStatus,
  usePendingReceived,
  usePendingSent,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useCancelFriendRequest,
  useRemoveFriend,
  useFollow,
  useUnfollow,
  useSendFollowRequest,
  useAddCloseFriend,
  useRemoveCloseFriend,
  useFollowers,
  useFollowing,
  useCloseFriends,
  useFriendSuggestions,
} from "@/features/friends/hooks";
import {
  useUserPosts,
  useSavedPosts,
  useHiddenPosts,
  useScheduledPosts,
  useDraftPosts,
  useDeletePost,
  useSavePost,
  useUnsavePost,
  useHidePost,
  useUnhidePost,
  useLikePost,
  useUnlikePost,
  useRepostPost,
  usePinPost,
  useUnpinPost,
  useArchivePost,
  useUnarchivePost,
  useVotePoll,
} from "@/features/feed/hooks";
import { useAnalyticsOverview } from "@/features/analytics/hooks";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { useBlockUser, useUnblockUser, useMuteUser, useUnmuteUser, useBlockedUsers, useMutedUsers } from "@/features/privacy/hooks";

type ProfileTab = "posts" | "about" | "friends" | "analytics" | "saved" | "hidden" | "scheduled" | "drafts";

const ALL_TABS: ProfileTab[] = ["posts", "about", "friends", "analytics", "saved", "hidden", "scheduled", "drafts"];

type FriendsSubTab = "all" | "suggestions" | "pending" | "followers" | "following" | "close";

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuthStore();
  const isOwn = !username || username === user?.username;

  const { data: myProfile, isLoading: myLoading } = useMyProfile(isOwn ? user?.id : undefined);
  const { data: publicProfile, isLoading: publicLoading } = usePublicProfile(!isOwn ? username : undefined);

  const profile = isOwn ? myProfile : publicProfile;
  const isLoading = isOwn ? myLoading : publicLoading;

  const { data: friendCounts } = useFriendCounts(isOwn ? user?.id : undefined);

  const updateProfile = useUpdateProfile(user?.id || "");
  const updateAvatar = useUpdateAvatar(user?.id || "");
  const updateCoverPhoto = useUpdateCoverPhoto(user?.id || "");

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as ProfileTab | null;
  const initialTab: ProfileTab = tabParam && ALL_TABS.includes(tabParam) ? tabParam : "posts";
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  const [friendsSubTab, setFriendsSubTab] = useState<FriendsSubTab>("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const selectTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    setSearchParams(tab === "posts" ? {} : { tab }, { replace: true });
  };

  useEffect(() => {
    const current = searchParams.get("tab") as ProfileTab | null;
    if (current && ALL_TABS.includes(current) && current !== activeTab) {
      setActiveTab(current);
    }
  }, [searchParams]);

  const targetUserId = profile?.id;
  const { data: userPostsData, isLoading: postsLoading } = useUserPosts(
    user?.id,
    isOwn ? user?.id : targetUserId
  );
  const userPosts = userPostsData?.pages?.flatMap((page) => page.posts) ?? [];
  const { data: friends = [], isLoading: friendsLoading } = useFriends(
    user?.id,
    isOwn ? undefined : targetUserId
  );
  const { data: savedPosts = [], isLoading: savedLoading } = useSavedPosts(isOwn ? user?.id : undefined);
  const { data: hiddenPosts = [], isLoading: hiddenLoading } = useHiddenPosts(isOwn ? user?.id : undefined);
  const { data: scheduledPosts = [], isLoading: scheduledLoading } = useScheduledPosts(isOwn ? user?.id : undefined);
  const { data: draftPosts = [], isLoading: draftsLoading } = useDraftPosts(isOwn ? user?.id : undefined);
  const { data: mutualFriends = [] } = useMutualFriends(
    user?.id,
    !isOwn && user?.id ? targetUserId : undefined
  );

  const { toast } = useToast();
  const userId = user?.id || "";
  const deletePost = useDeletePost();
  const savePost = useSavePost(userId);
  const unsavePost = useUnsavePost(userId);
  const hidePost = useHidePost();
  const unhidePost = useUnhidePost(userId);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const repostPost = useRepostPost();
  const pinPost = usePinPost();
  const unpinPost = useUnpinPost();
  const archivePost = useArchivePost(userId);
  const unarchivePost = useUnarchivePost(userId);
  const votePoll = useVotePoll();

  const blockUser = useBlockUser(userId);
  const unblockUser = useUnblockUser(userId);
  const muteUser = useMuteUser(userId);
  const unmuteUser = useUnmuteUser(userId);
  const { data: blockedUsers = [] } = useBlockedUsers(userId);
  const { data: mutedUsers = [] } = useMutedUsers(userId);
  const isBlocked = blockedUsers.some((u: { id: string }) => u.id === targetUserId);
  const isMuted = mutedUsers.some((u: { id: string }) => u.id === targetUserId);

  const { data: friendshipStatus, isLoading: statusLoading } = useFriendshipStatus(
    user?.id,
    !isOwn && user?.id && targetUserId ? targetUserId : undefined
  );
  const { data: pendingReceived = [] } = usePendingReceived(user?.id);
  const { data: pendingSent = [] } = usePendingSent(user?.id);
  const incomingFriendshipId = friendshipStatus?.status === "pending" && !friendshipStatus.is_requester
    ? pendingReceived.find((r) => r.id === targetUserId)?.friendship_id || ""
    : "";
  const outgoingFriendshipId = friendshipStatus?.status === "pending" && friendshipStatus.is_requester
    ? pendingSent.find((r) => r.id === targetUserId)?.friendship_id || ""
    : "";
  const currentFriendshipId = incomingFriendshipId || outgoingFriendshipId;
  const sendFriendRequest = useSendFriendRequest(userId);
  const acceptFriendRequest = useAcceptFriendRequest(userId);
  const rejectFriendRequest = useRejectFriendRequest(userId);
  const cancelFriendRequest = useCancelFriendRequest(userId);
  const removeFriend = useRemoveFriend(userId);
  const followUser = useFollow(userId);
  const unfollowUser = useUnfollow(userId);
  const sendFollowRequest = useSendFollowRequest(userId);
  const addCloseFriend = useAddCloseFriend(userId);
  const removeCloseFriend = useRemoveCloseFriend(userId);

  const { data: followers = [], isLoading: followersLoading } = useFollowers(userId || undefined);
  const { data: following = [], isLoading: followingLoading } = useFollowing(userId || undefined);
  const { data: closeFriends = [], isLoading: closeFriendsLoading } = useCloseFriends(userId || undefined);
  const { data: suggestions = [], isLoading: suggestionsLoading } = useFriendSuggestions(userId || undefined);

  const analyticsOverview = useAnalyticsOverview();

  const postCardHandlers: PostCardHandlers = {
    onOpenPost: (post) => setSelectedPost(post),
    onDelete: (id) => deletePost.mutate(id, {
      onSuccess: () => toast({ title: "Post deleted" }),
      onError: () => toast({ title: "Failed to delete post", variant: "destructive" }),
    }),
    onSave: (id) => savePost.mutate(id),
    onUnsave: (id) => unsavePost.mutate(id),
    onHide: (id) => hidePost.mutate(id),
    onUnhide: (id) => unhidePost.mutate(id),
    onLike: (id) => likePost.mutate(id),
    onUnlike: (id) => unlikePost.mutate(id),
    onRepost: (id) => repostPost.mutate({ postId: id }),
    onVotePoll: (pollId, optionId) => votePoll.mutate({ pollId, optionId }),
    onPin: (id) => pinPost.mutate(id),
    onUnpin: (id) => unpinPost.mutate(id),
    onArchive: (id) => archivePost.mutate(id),
    onUnarchive: (id) => unarchivePost.mutate(id),
    onBlock: (uid) => blockUser.mutate(uid, { onSuccess: () => toast({ title: "User blocked" }) }),
    onMute: (uid) => muteUser.mutate(uid, { onSuccess: () => toast({ title: "User muted" }) }),
    onReport: (_postId) => toast({ title: "Report submitted", description: "Thank you for your report." }),
    onFollow: (uid) => followUser.mutate(uid, { onSuccess: () => toast({ title: "Following" }) }),
    onAddFriend: (uid) => sendFriendRequest.mutate(uid, { onSuccess: () => toast({ title: "Friend request sent" }) }),
    onAddCloseFriend: (uid) => addCloseFriend.mutate(uid, { onSuccess: () => toast({ title: "Added to close friends" }) }),
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Profile not found</h1>
          <p className="mt-2 text-muted-foreground">
            This user does not exist or has been deactivated.
          </p>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (data: Parameters<typeof updateProfile.mutateAsync>[0]) => {
    await updateProfile.mutateAsync(data);
  };

  const handleUpdateAvatar = async (url: string) => {
    await updateAvatar.mutateAsync({ avatar_url: url });
  };

  const handleUpdateCoverPhoto = async (url: string) => {
    await updateCoverPhoto.mutateAsync({ cover_photo_url: url });
  };

  const tabs = [
    { key: "posts" as const, label: "Posts", icon: FileText },
    { key: "about" as const, label: "About", icon: Users },
    { key: "friends" as const, label: "Friends", icon: UserPlus },
    ...(isOwn ? [
      { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
      { key: "saved" as const, label: "Saved", icon: Bookmark },
      { key: "hidden" as const, label: "Hidden", icon: EyeOff },
      { key: "scheduled" as const, label: "Scheduled", icon: Clock },
      { key: "drafts" as const, label: "Drafts", icon: FileEdit },
    ] : []),
  ];

  const friendsTabs: { key: FriendsSubTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "all", label: "Friends", icon: <Users className="h-4 w-4" />, count: friendCounts?.friends },
    { key: "suggestions", label: "Suggestions", icon: <UserPlus2 className="h-4 w-4" />, count: suggestions.length },
    { key: "pending", label: "Requests", icon: <Clock className="h-4 w-4" />, count: pendingReceived.length + pendingSent.length },
    { key: "followers", label: "Followers", icon: <Heart className="h-4 w-4" />, count: friendCounts?.followers },
    { key: "following", label: "Following", icon: <HeartOff className="h-4 w-4" />, count: friendCounts?.following },
    { key: "close", label: "Close Friends", icon: <Star className="h-4 w-4" />, count: friendCounts?.close_friends },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-5xl px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <ProfileHeader
            profile={profile}
            isOwn={isOwn}
            onEditCover={() => coverInputRef.current?.click()}
            onEditAvatar={() => avatarInputRef.current?.click()}
          />
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = async (ev) => {
                const url = ev.target?.result as string;
                await handleUpdateAvatar(url);
              };
              reader.readAsDataURL(file);
              e.target.value = "";
            }}
          />
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = async (ev) => {
                const url = ev.target?.result as string;
                await handleUpdateCoverPhoto(url);
              };
              reader.readAsDataURL(file);
              e.target.value = "";
            }}
          />

          <div className="flex flex-wrap items-center justify-end gap-2 px-1 pt-1 md:px-0 md:pt-0">
            {isOwn && (
              <>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowQRCode(!showQRCode)}>
                  <QrCode className="mr-1.5 h-4 w-4" />
                  QR Code
                </Button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowPreview(!showPreview)}>
                  <Eye className="mr-1.5 h-4 w-4" />
                  Preview
                </Button>
                <Button size="sm" className="rounded-full" onClick={() => setIsEditModalOpen(true)}>
                  <Settings className="mr-1.5 h-4 w-4" />
                  Edit Profile
                </Button>
              </>
            )}
            {!isOwn && targetUserId && (
              <>
                <RelationshipButton
                  status={friendshipStatus}
                  isLoading={statusLoading}
                  isFriendLoading={sendFriendRequest.isPending || acceptFriendRequest.isPending || rejectFriendRequest.isPending || cancelFriendRequest.isPending || removeFriend.isPending}
                  isFollowLoading={followUser.isPending || unfollowUser.isPending || sendFollowRequest.isPending}
                  onAddFriend={() => sendFriendRequest.mutate(targetUserId, { onSuccess: () => toast({ title: "Friend request sent" }) })}
                  onCancelRequest={() => cancelFriendRequest.mutate(currentFriendshipId, { onSuccess: () => toast({ title: "Request cancelled" }) })}
                  onAcceptRequest={() => acceptFriendRequest.mutate(currentFriendshipId, { onSuccess: () => toast({ title: "Friend request accepted" }) })}
                  onRejectRequest={() => rejectFriendRequest.mutate(currentFriendshipId, { onSuccess: () => toast({ title: "Request rejected" }) })}
                  onRemoveFriend={() => removeFriend.mutate(targetUserId, { onSuccess: () => toast({ title: "Friend removed" }) })}
                  onFollow={() => followUser.mutate(targetUserId, { onSuccess: () => toast({ title: "Following" }) })}
                  onUnfollow={() => unfollowUser.mutate(targetUserId, { onSuccess: () => toast({ title: "Unfollowed" }) })}
                  onRequestFollow={() => sendFollowRequest.mutate(targetUserId, { onSuccess: () => toast({ title: "Follow request sent" }) })}
                  size="sm"
                />
                {friendshipStatus?.is_close_friend ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() => removeCloseFriend.mutate(targetUserId, { onSuccess: () => toast({ title: "Removed from close friends" }) })}
                  >
                    <Star className="mr-1.5 h-4 w-4 fill-primary text-primary" />
                    Close Friend
                  </Button>
                ) : friendshipStatus?.status === "accepted" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() => addCloseFriend.mutate(targetUserId, { onSuccess: () => toast({ title: "Added to close friends" }) })}
                  >
                    <Star className="mr-1.5 h-4 w-4" />
                    Add Close Friend
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    if (isMuted) {
                      unmuteUser.mutate(targetUserId, { onSuccess: () => toast({ title: "User unmuted" }) });
                    } else {
                      muteUser.mutate(targetUserId, { onSuccess: () => toast({ title: "User muted" }) });
                    }
                  }}
                >
                  <VolumeX className="mr-1.5 h-4 w-4" />
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    if (isBlocked) {
                      unblockUser.mutate(targetUserId, { onSuccess: () => toast({ title: "User unblocked" }) });
                    } else {
                      blockUser.mutate(targetUserId, { onSuccess: () => toast({ title: "User blocked" }) });
                    }
                  }}
                >
                  <Ban className="mr-1.5 h-4 w-4" />
                  {isBlocked ? "Unblock" : "Block"}
                </Button>
              </>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
              <div role="tablist" aria-label="Profile sections" className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {tabs.map((tab) => (
                  <Button
                    key={tab.key}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    aria-controls={`profile-panel-${tab.key}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => selectTab(tab.key)}
                    className={cn(
                      "gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-all",
                      activeTab === tab.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </Button>
                ))}
              </div>

              {activeTab === "posts" && (
                <ProfilePostList
                  icon={FileText}
                  posts={userPosts}
                  isLoading={postsLoading}
                  emptyTitle="No posts yet"
                  emptyDescription={isOwn ? "Share your first post!" : "This user hasn't posted yet."}
                  currentUserId={user?.id || ""}
                  {...postCardHandlers}
                />
              )}

              {activeTab === "about" && (
                <div className="rounded-2xl glass-card p-6">
                  <h2 className="mb-4 text-lg font-semibold">About</h2>
                  <ProfileInfo profile={profile} />
                </div>
              )}

              {activeTab === "friends" && (
                <div className="space-y-4">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {friendsTabs.map((tab) => (
                      <Button
                        key={tab.key}
                        variant="ghost"
                        size="sm"
                        onClick={() => setFriendsSubTab(tab.key)}
                        className={cn(
                          "gap-1.5 rounded-full px-3.5 text-xs font-medium whitespace-nowrap transition-all",
                          friendsSubTab === tab.key
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-muted-foreground hover:bg-muted"
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

                  {friendsSubTab === "all" && (
                    <>
                      {friendsLoading ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : friends.length === 0 ? (
                    <div className="rounded-2xl glass-card border border-dashed p-8 text-center">
                           <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
                          <p className="mt-4 font-semibold">No friends yet</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {isOwn ? "Connect with people to see them here." : "This user hasn't added any friends yet."}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                          {friends.map((friend) => (
                            <Link
                              key={friend.id}
                              to={`/profile/${friend.username}`}
                              className="group rounded-2xl glass-card p-4 text-center transition-all hover:shadow-elevated"
                            >
                              <Avatar
                                src={friend.avatar_url}
                                alt={friend.full_name || undefined}
                                fallback={(friend.full_name || "U")[0].toUpperCase()}
                                size="lg"
                                className="mx-auto"
                              />
                              <p className="mt-3 truncate text-sm font-semibold group-hover:text-primary">
                                {friend.full_name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                @{friend.username}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {friendsSubTab === "suggestions" && (
                    <>
                      {suggestionsLoading ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : suggestions.length === 0 ? (
                        <div className="rounded-2xl border border-dashed bg-card p-8 text-center shadow-card">
                          <UserPlus2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
                          <p className="mt-4 font-semibold">No suggestions</p>
                          <p className="mt-1 text-sm text-muted-foreground">Check back later for friend suggestions.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {suggestions.map((suggestion) => (
                            <div key={suggestion.id} className="flex items-center gap-3 rounded-2xl glass-card p-3 transition-all hover:shadow-elevated">
                              <Avatar
                                src={suggestion.avatar_url}
                                alt={suggestion.full_name || undefined}
                                fallback={(suggestion.full_name || "U")[0].toUpperCase()}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-medium">{suggestion.full_name}</p>
                                <p className="truncate text-xs text-muted-foreground">@{suggestion.username}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full text-xs"
                                onClick={() => sendFriendRequest.mutate(suggestion.id, {
                                  onSuccess: () => toast({ title: "Friend request sent" }),
                                })}
                                disabled={sendFriendRequest.isPending}
                              >
                                <UserPlus className="mr-1 h-3 w-3" />
                                Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {friendsSubTab === "pending" && (
                    <div className="space-y-4">
                      {pendingReceived.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Received</h3>
                          {pendingReceived.map((request) => (
                            <div key={request.id} className="flex items-center gap-3 rounded-2xl glass-card p-3">
                              <Avatar
                                src={request.avatar_url}
                                alt={request.full_name || undefined}
                                fallback={(request.full_name || "U")[0].toUpperCase()}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-medium">{request.full_name}</p>
                                <p className="truncate text-xs text-muted-foreground">@{request.username}</p>
                              </div>
                              <div className="flex gap-1.5">
                                <Button size="sm" variant="default" className="rounded-full" onClick={() => acceptFriendRequest.mutate(request.friendship_id!)}>
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Accept
                                </Button>
                                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => rejectFriendRequest.mutate(request.friendship_id!)}>
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {pendingSent.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sent</h3>
                          {pendingSent.map((request) => (
                            <div key={request.id} className="flex items-center gap-3 rounded-2xl glass-card p-3">
                              <Avatar
                                src={request.avatar_url}
                                alt={request.full_name || undefined}
                                fallback={(request.full_name || "U")[0].toUpperCase()}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-medium">{request.full_name}</p>
                                <p className="truncate text-xs text-muted-foreground">@{request.username}</p>
                              </div>
                              <Button size="sm" variant="ghost" className="rounded-full text-xs" onClick={() => cancelFriendRequest.mutate(request.friendship_id!)}>
                                Cancel
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {pendingReceived.length === 0 && pendingSent.length === 0 && (
                        <div className="rounded-2xl glass-card border border-dashed p-8 text-center">
                          <Clock className="mx-auto h-12 w-12 text-muted-foreground/40" />
                          <p className="mt-4 font-semibold">No pending requests</p>
                        </div>
                      )}
                    </div>
                  )}

                  {friendsSubTab === "followers" && (
                    <>
                      {followersLoading ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : followers.length === 0 ? (
                        <div className="rounded-2xl border border-dashed bg-card p-8 text-center shadow-card">
                          <Heart className="mx-auto h-12 w-12 text-muted-foreground/40" />
                          <p className="mt-4 font-semibold">No followers yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {followers.map((follower) => (
                            <div key={follower.id} className="flex items-center gap-3 rounded-2xl glass-card p-3">
                              <Avatar
                                src={follower.avatar_url}
                                alt={follower.full_name || undefined}
                                fallback={(follower.full_name || "U")[0].toUpperCase()}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-medium">{follower.full_name}</p>
                                <p className="truncate text-xs text-muted-foreground">@{follower.username}</p>
                              </div>
                              <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => followUser.mutate(follower.id)}>
                                <UserCheck className="mr-1 h-3 w-3" />
                                Follow
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {friendsSubTab === "following" && (
                    <>
                      {followingLoading ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : following.length === 0 ? (
                        <div className="rounded-2xl border border-dashed bg-card p-8 text-center shadow-card">
                          <HeartOff className="mx-auto h-12 w-12 text-muted-foreground/40" />
                          <p className="mt-4 font-semibold">Not following anyone yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {following.map((followed) => (
                            <div key={followed.id} className="flex items-center gap-3 rounded-2xl glass-card p-3">
                              <Avatar
                                src={followed.avatar_url}
                                alt={followed.full_name || undefined}
                                fallback={(followed.full_name || "U")[0].toUpperCase()}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-medium">{followed.full_name}</p>
                                <p className="truncate text-xs text-muted-foreground">@{followed.username}</p>
                              </div>
                              <Button size="sm" variant="ghost" className="rounded-full text-xs" onClick={() => unfollowUser.mutate(followed.id)}>
                                <UserMinus2 className="mr-1 h-3 w-3" />
                                Unfollow
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {friendsSubTab === "close" && (
                    <>
                      {closeFriendsLoading ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : closeFriends.length === 0 ? (
                        <div className="rounded-2xl border border-dashed bg-card p-8 text-center shadow-card">
                          <Star className="mx-auto h-12 w-12 text-muted-foreground/40" />
                          <p className="mt-4 font-semibold">No close friends yet</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Add close friends to share exclusive content.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {closeFriends.map((cf) => (
                            <div key={cf.id} className="flex items-center gap-3 rounded-2xl glass-card p-3">
                              <Avatar
                                src={cf.avatar_url}
                                alt={cf.full_name || undefined}
                                fallback={(cf.full_name || "U")[0].toUpperCase()}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-medium">{cf.full_name}</p>
                                <p className="truncate text-xs text-muted-foreground">@{cf.username}</p>
                              </div>
                              <Button size="sm" variant="ghost" className="rounded-full text-xs" onClick={() => removeCloseFriend.mutate(cf.id)}>
                                <UserMinus2 className="mr-1 h-3 w-3" />
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === "analytics" && isOwn && (
                <div className="space-y-4">
                  {analyticsOverview.isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : analyticsOverview.error ? (
                    <div className="rounded-2xl glass-card p-8 text-center">
                       <p className="text-sm text-muted-foreground">Failed to load analytics.</p>
                      <Button variant="outline" size="sm" className="mt-3 rounded-full" onClick={() => analyticsOverview.refetch()}>
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Retry
                      </Button>
                    </div>
                  ) : analyticsOverview.data ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <StatCard label="Total Posts" value={analyticsOverview.data.total_posts} icon={FileText} />
                        <StatCard label="Followers" value={analyticsOverview.data.total_followers} icon={UserPlus} />
                        <StatCard label="Profile Views" value={analyticsOverview.data.total_profile_views} icon={Eye} />
                        <StatCard label="Reels" value={analyticsOverview.data.total_reels} icon={FileEdit} />
                        <StatCard label="Videos" value={analyticsOverview.data.total_videos} icon={FileEdit} />
                      </div>
                      <div className="rounded-2xl glass-card p-4 text-center">
                        <Link to="/analytics">
                          <Button variant="ghost" size="sm" className="rounded-full text-primary">
                            <BarChart3 className="mr-1.5 h-4 w-4" />
                            View Full Analytics Dashboard
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {activeTab === "saved" && isOwn && (
                <ProfilePostList
                  title="Saved Posts"
                  icon={Bookmark}
                  posts={savedPosts}
                  isLoading={savedLoading}
                  emptyTitle="No saved posts"
                  emptyDescription="Save posts to revisit them later."
                  currentUserId={user?.id || ""}
                  {...postCardHandlers}
                />
              )}

              {activeTab === "hidden" && isOwn && (
                <ProfilePostList
                  title="Hidden Posts"
                  icon={EyeOff}
                  posts={hiddenPosts}
                  isLoading={hiddenLoading}
                  emptyTitle="No hidden posts"
                  emptyDescription="Posts you hide will appear here."
                  currentUserId={user?.id || ""}
                  unhideMode
                  {...postCardHandlers}
                />
              )}

              {activeTab === "scheduled" && isOwn && (
                <ProfilePostList
                  title="Scheduled Posts"
                  icon={Clock}
                  posts={scheduledPosts}
                  isLoading={scheduledLoading}
                  emptyTitle="No scheduled posts"
                  emptyDescription="Schedule posts to publish later."
                  currentUserId={user?.id || ""}
                  {...postCardHandlers}
                />
              )}

              {activeTab === "drafts" && isOwn && (
                <ProfilePostList
                  title="Draft Posts"
                  icon={FileEdit}
                  posts={draftPosts}
                  isLoading={draftsLoading}
                  emptyTitle="No drafts"
                  emptyDescription="Save a post as a draft to finish later."
                  currentUserId={user?.id || ""}
                  {...postCardHandlers}
                />
              )}
            </div>

            <div className="space-y-5">
              {isOwn && friendCounts && (
                <div className="rounded-2xl glass-card p-6">
                  <h3 className="mb-4 text-sm font-bold text-muted-foreground">Connections</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-purple-500/5 p-3 text-center transition-all hover:shadow-card backdrop-blur-sm">
                      <p className="text-xl font-bold">{friendCounts.friends}</p>
                      <p className="text-xs text-muted-foreground">Friends</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-pink-500/5 to-rose-500/5 p-3 text-center transition-all hover:shadow-card backdrop-blur-sm">
                      <p className="text-xl font-bold">{friendCounts.followers}</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-3 text-center transition-all hover:shadow-card backdrop-blur-sm">
                      <p className="text-xl font-bold">{friendCounts.following}</p>
                      <p className="text-xs text-muted-foreground">Following</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-3 text-center transition-all hover:shadow-card backdrop-blur-sm">
                      <p className="text-xl font-bold">{friendCounts.close_friends}</p>
                      <p className="text-xs text-muted-foreground">Close Friends</p>
                    </div>
                  </div>
                </div>
              )}

              {!isOwn && mutualFriends.length > 0 && (
                <div className="rounded-2xl glass-card p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Mutual Friends ({mutualFriends.length})
                  </h3>
                  <div className="space-y-2">
                    {mutualFriends.slice(0, 5).map((friend) => (
                      <Link
                        key={friend.id}
                        to={`/profile/${friend.username}`}
                        className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-muted/50"
                      >
                        <Avatar
                          src={friend.avatar_url}
                          alt={friend.full_name || undefined}
                          fallback={(friend.full_name || "U")[0].toUpperCase()}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{friend.full_name}</p>
                          <p className="truncate text-xs text-muted-foreground">@{friend.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {isOwn && (
                <div className="rounded-2xl glass-card p-6">
                  <UsernameEditor
                    currentUsername={profile.username}
                    onSave={async (username: string) => {
                      await updateProfile.mutateAsync({ username });
                    }}
                  />
                </div>
              )}

              {showQRCode && isOwn && (
                <ProfileQRCode profile={profile} />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {isOwn && (
        <EditProfileModal
          profile={profile}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateProfile}
        />
      )}

      {showPreview && (
        <ProfilePreview
          profile={profile}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          currentUserId={user?.id || ""}
          isOpen={selectedPost !== null}
          onClose={() => setSelectedPost(null)}
          onDelete={(id) => deletePost.mutate(id)}
          onSave={(id) => savePost.mutate(id)}
          onUnsave={(id) => unsavePost.mutate(id)}
          onHide={(id) => hidePost.mutate(id)}
          onUnhide={(id) => unhidePost.mutate(id)}
          onLike={(id) => likePost.mutate(id)}
          onUnlike={(id) => unlikePost.mutate(id)}
          onRepost={(id) => repostPost.mutate({ postId: id })}
          onVotePoll={(pollId, optionId) => votePoll.mutate({ pollId, optionId })}
          onPin={(id) => pinPost.mutate(id)}
          onUnpin={(id) => unpinPost.mutate(id)}
          onArchive={(id) => archivePost.mutate(id)}
          onUnarchive={(id) => unarchivePost.mutate(id)}
          onBlock={(uid) => blockUser.mutate(uid)}
          onMute={(uid) => muteUser.mutate(uid)}
          onReport={(_postId) => toast({ title: "Report submitted" })}
          onFollow={(uid) => followUser.mutate(uid)}
          onAddFriend={(uid) => sendFriendRequest.mutate(uid)}
          onAddCloseFriend={(uid) => addCloseFriend.mutate(uid)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl glass-card p-4 transition-all hover:shadow-elevated">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-muted-foreground">{label}</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-purple-500/15">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
      </div>
      <p className="text-xl font-black">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}
