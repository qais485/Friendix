export interface FriendRequest {
  addressee_id: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "rejected";
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface FriendDetail {
  id: string;
  friendship_id: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  mutual_friends_count: number;
  is_close_friend: boolean;
}

export interface FollowUser {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  is_friend: boolean;
  mutual_friends_count: number;
}

export interface FriendshipStatus {
  status: "pending" | "accepted" | "rejected" | null;
  is_requester: boolean;
  is_favorite: boolean;
  is_close_friend: boolean;
  is_following: boolean;
  is_followed_by: boolean;
}

export interface FriendCounts {
  friends: number;
  followers: number;
  following: number;
  close_friends: number;
  pending_friend_requests: number;
  pending_follow_requests: number;
}

export interface FavoriteUpdate {
  is_favorite: boolean;
}

export interface CloseFriend {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
}

export interface CloseFriendDetail {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  added_at: string;
}

export interface FollowRequest {
  id: string;
  requester_id: string;
  target_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface FollowRequestDetail {
  id: string;
  request_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
}

export interface Mute {
  id: string;
  user_id: string;
  muted_user_id: string;
  mute_posts: boolean;
  mute_stories: boolean;
  mute_notes: boolean;
  mute_notifications: boolean;
  created_at: string;
}

export interface MuteDetail {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  mute_posts: boolean;
  mute_stories: boolean;
  mute_notes: boolean;
  mute_notifications: boolean;
}

export interface MuteUpdate {
  mute_posts?: boolean;
  mute_stories?: boolean;
  mute_notes?: boolean;
  mute_notifications?: boolean;
}

export interface Restrict {
  id: string;
  user_id: string;
  restricted_user_id: string;
  created_at: string;
}

export interface RestrictDetail {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  restricted_at: string;
}

export interface Block {
  id: string;
  blocked_user_id: string;
  blocked_at: string;
}

export interface BlockDetail {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  blocked_at: string;
}

export interface RelationshipSummary {
  are_friends: boolean;
  is_close_friend: boolean;
  is_following: boolean;
  is_followed_by: boolean;
  are_blocked: boolean;
  is_muted: boolean;
  is_restricted: boolean;
  mutual_friends_count: number;
}

export type FriendsTab = "all" | "suggestions" | "pending" | "followers" | "following" | "close";
