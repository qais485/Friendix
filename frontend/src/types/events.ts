export interface Event {
  id: string;
  creator_id: string;
  username: string | null;
  user_avatar: string | null;
  title: string;
  description: string | null;
  cover_url: string | null;
  event_type: "online" | "offline";
  location: string | null;
  online_link: string | null;
  start_time: string;
  end_time: string | null;
  attendees_count: number;
  invited_count: number;
  is_cancelled: boolean;
  is_creator: boolean;
  rsvp_status: string | null;
  reminder_minutes: number;
  created_at: string;
}

export interface EventRSVP {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
}

export interface EventInvite {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  inviter_id: string;
  inviter_username: string | null;
  status: string;
  created_at: string;
}

export interface EventChatMessage {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  content: string;
  created_at: string;
}

export interface EventListResponse {
  events: Event[];
}

export interface EventDetailResponse extends Event {}

export interface EventRSVPListResponse {
  attendees: EventRSVP[];
}

export interface EventInvitesResponse {
  invites: EventInvite[];
}

export interface EventChatMessagesResponse {
  messages: EventChatMessage[];
}

export type EventType = "online" | "offline";
export type RSVPStatus = "going" | "maybe" | "invited" | "declined";
