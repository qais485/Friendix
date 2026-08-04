import api from "./api";
import type {
  FriendRequest,
  Friendship,
  FriendDetail,
  FollowUser,
  FriendshipStatus,
  FriendCounts,
  FavoriteUpdate,
  CloseFriend,
  CloseFriendDetail,
  FollowRequest,
  FollowRequestDetail,
  Mute,
  MuteDetail,
  MuteUpdate,
  Restrict,
  RestrictDetail,
  Block,
  BlockDetail,
  RelationshipSummary,
} from "@/types";

export const friendsApi = {
  sendFriendRequest: (data: FriendRequest) =>
    api.post<Friendship>("/friends/request", data),

  acceptFriendRequest: (friendshipId: string) =>
    api.post<Friendship>(`/friends/accept/${friendshipId}`),

  rejectFriendRequest: (friendshipId: string) =>
    api.delete(`/friends/reject/${friendshipId}`),

  cancelFriendRequest: (friendshipId: string) =>
    api.delete(`/friends/cancel/${friendshipId}`),

  removeFriend: (friendId: string) =>
    api.delete(`/friends/remove/${friendId}`),

  getFriends: (targetUserId?: string) =>
    api.get<FriendDetail[]>("/friends/list", {
      params: targetUserId ? { target_user_id: targetUserId } : {},
    }),

  getPendingSent: () =>
    api.get<FriendDetail[]>("/friends/pending/sent"),

  getPendingReceived: () =>
    api.get<FriendDetail[]>("/friends/pending/received"),

  getFriendSuggestions: () =>
    api.get<FriendDetail[]>("/friends/suggestions"),

  getMutualFriends: (otherUserId: string) =>
    api.get<FriendDetail[]>(`/friends/mutual/${otherUserId}`),

  getFriendshipStatus: (otherUserId: string) =>
    api.get<FriendshipStatus>(`/friends/status/${otherUserId}`),

  updateFavorite: (friendId: string, data: FavoriteUpdate) =>
    api.put<Friendship>(`/friends/favorite/${friendId}`, data),

  getFavoriteFriends: () =>
    api.get<FriendDetail[]>("/friends/favorites"),

  addCloseFriend: (friendId: string) =>
    api.post<CloseFriend>(`/friends/close/${friendId}`),

  removeCloseFriend: (friendId: string) =>
    api.delete(`/friends/close/${friendId}`),

  getCloseFriends: () =>
    api.get<CloseFriendDetail[]>("/friends/close"),

  followUser: (followingId: string) =>
    api.post(`/friends/follow/${followingId}`),

  unfollowUser: (followingId: string) =>
    api.delete(`/friends/unfollow/${followingId}`),

  removeFollower: (followerId: string) =>
    api.delete(`/friends/remove-follower/${followerId}`),

  getFollowers: () =>
    api.get<FollowUser[]>("/friends/followers"),

  getFollowing: () =>
    api.get<FollowUser[]>("/friends/following"),

  sendFollowRequest: (targetId: string) =>
    api.post<FollowRequest>(`/friends/follow-request/${targetId}`),

  acceptFollowRequest: (requestId: string) =>
    api.post(`/friends/follow-request/accept/${requestId}`),

  rejectFollowRequest: (requestId: string) =>
    api.delete(`/friends/follow-request/reject/${requestId}`),

  cancelFollowRequest: (requestId: string) =>
    api.delete(`/friends/follow-request/cancel/${requestId}`),

  getPendingFollowSent: () =>
    api.get<FollowRequestDetail[]>("/friends/follow-requests/sent"),

  getPendingFollowReceived: () =>
    api.get<FollowRequestDetail[]>("/friends/follow-requests/received"),

  blockUser: (blockedUserId: string) =>
    api.post<Block>(`/friends/block/${blockedUserId}`),

  unblockUser: (blockedUserId: string) =>
    api.delete(`/friends/block/${blockedUserId}`),

  getBlockedUsers: () =>
    api.get<BlockDetail[]>("/friends/blocked"),

  muteUser: (mutedUserId: string, data?: MuteUpdate) =>
    api.post<Mute>(`/friends/mute/${mutedUserId}`, data),

  unmuteUser: (mutedUserId: string) =>
    api.delete(`/friends/mute/${mutedUserId}`),

  getMutedUsers: () =>
    api.get<MuteDetail[]>("/friends/muted"),

  restrictUser: (restrictedUserId: string) =>
    api.post<Restrict>(`/friends/restrict/${restrictedUserId}`),

  unrestrictUser: (restrictedUserId: string) =>
    api.delete(`/friends/restrict/${restrictedUserId}`),

  getRestrictedUsers: () =>
    api.get<RestrictDetail[]>("/friends/restricted"),

  getFriendCounts: () =>
    api.get<FriendCounts>("/friends/count"),

  getRelationshipSummary: (otherUserId: string) =>
    api.get<RelationshipSummary>(`/friends/summary/${otherUserId}`),
};
