export interface PrivacySetting {
  id: string;
  user_id: string;
  profile_visibility: "public" | "friends" | "private";
  hide_online_status: boolean;
  hide_last_seen: boolean;
  hide_birthday: boolean;
  hide_phone: boolean;
  hide_email: boolean;
  hide_work: boolean;
  hide_education: boolean;
  story_privacy: "everyone" | "friends" | "close_friends" | "followers" | "only_me" | "custom";
  post_privacy: "everyone" | "friends" | "close_friends" | "followers" | "friends_followers" | "only_me" | "custom";
  reel_privacy: "everyone" | "friends" | "close_friends" | "followers" | "only_me" | "custom";
  photo_privacy: "everyone" | "friends" | "close_friends" | "followers" | "only_me" | "custom";
  video_privacy: "everyone" | "friends" | "close_friends" | "followers" | "only_me" | "custom";
  comment_privacy: "everyone" | "friends" | "close_friends" | "followers" | "only_me" | "custom";
  tag_review: boolean;
  timeline_review: boolean;
  search_engine_visibility: boolean;
  mention_permissions: "everyone" | "friends" | "close_friends" | "none";
  follow_permissions: "everyone" | "friends" | "none";
  friend_request_permissions: "everyone" | "friends" | "none";
  message_permissions: "everyone" | "friends" | "close_friends" | "none";
  call_permissions: "everyone" | "friends" | "close_friends" | "none";
  hide_friends_list: boolean;
  hide_followers_list: boolean;
  hide_following_list: boolean;
  download_media_permissions: "everyone" | "friends" | "close_friends" | "none";
  invite_permissions: "everyone" | "friends" | "close_friends" | "none";
  created_at: string;
  updated_at: string;
}

export interface PrivacySettingUpdate {
  profile_visibility?: "public" | "friends" | "private";
  hide_online_status?: boolean;
  hide_last_seen?: boolean;
  hide_birthday?: boolean;
  hide_phone?: boolean;
  hide_email?: boolean;
  hide_work?: boolean;
  hide_education?: boolean;
  story_privacy?: "everyone" | "friends" | "close_friends" | "followers" | "only_me" | "custom";
  post_privacy?: "everyone" | "friends" | "close_friends" | "followers" | "friends_followers" | "only_me" | "custom";
  reel_privacy?: "everyone" | "friends" | "close_friends" | "followers" | "only_me" | "custom";
  photo_privacy?: "everyone" | "friends" | "close_friends" | "followers" | "only_me" | "custom";
  video_privacy?: "everyone" | "friends" | "close_friends" | "followers" | "only_me" | "custom";
  comment_privacy?: "everyone" | "friends" | "close_friends" | "followers" | "only_me" | "custom";
  tag_review?: boolean;
  timeline_review?: boolean;
  search_engine_visibility?: boolean;
  mention_permissions?: "everyone" | "friends" | "close_friends" | "none";
  follow_permissions?: "everyone" | "friends" | "none";
  friend_request_permissions?: "everyone" | "friends" | "none";
  message_permissions?: "everyone" | "friends" | "close_friends" | "none";
  call_permissions?: "everyone" | "friends" | "close_friends" | "none";
  hide_friends_list?: boolean;
  hide_followers_list?: boolean;
  hide_following_list?: boolean;
  download_media_permissions?: "everyone" | "friends" | "close_friends" | "none";
  invite_permissions?: "everyone" | "friends" | "close_friends" | "none";
}

export interface BlockedUser {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export interface BlockUserRequest {
  blocked_user_id: string;
}

export type BlockType = "block" | "mute" | "restrict";
