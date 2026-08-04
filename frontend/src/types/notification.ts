export interface NotificationActor {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: "like" | "comment" | "friend_request" | "friend_accept" | "follow" | "mention" | "share" | "message" | "birthday" | "live" | "system";
  entity_type: "post" | "comment" | "message" | "user" | "live" | "story";
  entity_id: string;
  entity_user_id: string | null;
  content: string | null;
  extra_json: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  actor: NotificationActor | null;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
  has_more: boolean;
}

export interface NotificationCountResponse {
  unread_count: number;
}

export interface NotificationMarkReadRequest {
  notification_ids: string[];
}
