export interface Group {
  id: string;
  creator_id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  privacy: "public" | "private" | "hidden";
  members_count: number;
  rules: string | null;
  is_active: boolean;
  is_member: boolean;
  member_role: string | null;
  has_pending_request: boolean;
  created_at: string;
}

export interface GroupMember {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: "admin" | "moderator" | "member";
  status: "pending" | "approved" | "rejected";
  joined_at: string;
}

export interface GroupJoinRequest {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  status: string;
  message: string | null;
  created_at: string;
}

export interface GroupAnnouncement {
  id: string;
  author_id: string;
  username: string | null;
  avatar_url: string | null;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export interface GroupEvent {
  id: string;
  creator_id: string;
  username: string | null;
  avatar_url: string | null;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string | null;
  cover_url: string | null;
  attendees_count: number;
  is_attending: boolean;
  created_at: string;
}

export interface GroupPoll {
  id: string;
  creator_id: string;
  username: string | null;
  question: string;
  options: string[];
  expires_at: string | null;
  is_anonymous: boolean;
  total_votes: number;
  user_vote: number | null;
  option_votes: number[];
  created_at: string;
}

export interface GroupMessage {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  content: string;
  is_announcement: boolean;
  created_at: string;
}

export interface GroupListResponse {
  groups: Group[];
}

export interface GroupMembersResponse {
  members: GroupMember[];
}

export interface GroupJoinRequestsResponse {
  requests: GroupJoinRequest[];
}

export interface GroupAnnouncementsResponse {
  announcements: GroupAnnouncement[];
}

export interface GroupEventsResponse {
  events: GroupEvent[];
}

export interface GroupPollsResponse {
  polls: GroupPoll[];
}

export interface GroupMessagesResponse {
  messages: GroupMessage[];
}

export type GroupPrivacy = "public" | "private" | "hidden";
export type GroupMemberRole = "admin" | "moderator" | "member";
