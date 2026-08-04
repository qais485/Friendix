export interface LiveStream {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  stream_key: string;
  stream_url: string | null;
  playback_url: string | null;
  status: "scheduled" | "live" | "ended" | "recording" | "replay";
  privacy: "everyone" | "friends" | "only_me";
  is_recording: boolean;
  replay_url: string | null;
  replay_duration: number | null;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  viewers_count: number;
  peak_viewers_count: number;
  likes_count: number;
  comments_count: number;
  donations_count: number;
  donations_total: number;
  allow_chat: boolean;
  allow_reactions: boolean;
  allow_donations: boolean;
  allow_guests: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  is_viewer?: boolean;
  is_host?: boolean;
  is_guest?: boolean;
  is_moderator?: boolean;
  guest_status?: "pending" | "accepted" | "rejected" | "removed";
}

export interface LiveChatMessage {
  id: string;
  stream_id: string;
  user_id: string;
  content: string;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface LiveReaction {
  id: string;
  stream_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface LiveDonation {
  id: string;
  stream_id: string;
  user_id: string;
  amount: number;
  currency: string;
  message: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface LiveGuest {
  id: string;
  stream_id: string;
  user_id: string;
  status: "pending" | "accepted" | "rejected" | "removed";
  joined_at: string | null;
  left_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface LiveModerator {
  id: string;
  stream_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface LiveViewer {
  id: string;
  stream_id: string;
  user_id: string;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface LiveStreamCreate {
  title: string;
  description?: string;
  thumbnail_url?: string;
  privacy?: "everyone" | "friends" | "only_me";
  allow_chat?: boolean;
  allow_reactions?: boolean;
  allow_donations?: boolean;
  allow_guests?: boolean;
}

export interface LiveStreamUpdate {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  privacy?: "everyone" | "friends" | "only_me";
  allow_chat?: boolean;
  allow_reactions?: boolean;
  allow_donations?: boolean;
  allow_guests?: boolean;
}

export interface LiveScheduleRequest {
  scheduled_at: string;
}

export interface LiveChatMessageCreate {
  content: string;
}

export interface LiveReactionCreate {
  emoji: string;
}

export interface LiveDonationCreate {
  amount: number;
  currency?: string;
  message?: string;
  is_anonymous?: boolean;
}

export interface LiveGuestCreate {
  user_id: string;
}

export interface LiveModeratorCreate {
  user_id: string;
}

export interface LiveStreamListResponse {
  streams: LiveStream[];
  total: number;
  has_more: boolean;
}

export interface LiveChatMessageListResponse {
  messages: LiveChatMessage[];
  total: number;
  has_more: boolean;
}

export interface LiveDonationListResponse {
  donations: LiveDonation[];
  total: number;
  has_more: boolean;
}
