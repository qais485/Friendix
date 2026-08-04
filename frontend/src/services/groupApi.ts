import api from "./api";
import type {
  GroupListResponse,
  Group,
  GroupMembersResponse,
  GroupJoinRequestsResponse,
  GroupAnnouncementsResponse,
  GroupEventsResponse,
  GroupPollsResponse,
  GroupMessagesResponse,
} from "@/types";

export const groupApi = {
  list: (q?: string, limit = 20, offset = 0) =>
    api.get<GroupListResponse>("/groups", {
      params: { q, limit, offset },
    }),

  getMyGroups: () =>
    api.get<GroupListResponse>("/groups/my"),

  getDetail: (slug: string) =>
    api.get<Group>(`/groups/${slug}`),

  create: (data: { name: string; description?: string; privacy?: string; rules?: string }) =>
    api.post<Group>("/groups", data),

  update: (slug: string, data: { name?: string; description?: string; cover_url?: string; privacy?: string; rules?: string }) =>
    api.put<Group>(`/groups/${slug}`, data),

  delete: (slug: string) =>
    api.delete(`/groups/${slug}`),

  join: (slug: string, message?: string) =>
    api.post<{ message: string; status: string }>(`/groups/${slug}/join`, null, { params: { message } }),

  leave: (slug: string) =>
    api.post(`/groups/${slug}/leave`),

  getMembers: (slug: string) =>
    api.get<GroupMembersResponse>(`/groups/${slug}/members`),

  updateMemberRole: (slug: string, userId: string, role: string) =>
    api.put(`/groups/${slug}/members/${userId}/role`, { role }),

  removeMember: (slug: string, userId: string) =>
    api.delete(`/groups/${slug}/members/${userId}`),

  getJoinRequests: (slug: string) =>
    api.get<GroupJoinRequestsResponse>(`/groups/${slug}/join-requests`),

  handleJoinRequest: (slug: string, requestId: string, status: string) =>
    api.put(`/groups/${slug}/join-requests/${requestId}`, { status }),

  createAnnouncement: (slug: string, data: { title: string; content: string }) =>
    api.post<GroupAnnouncementsResponse>(`/groups/${slug}/announcements`, data),

  getAnnouncements: (slug: string) =>
    api.get<GroupAnnouncementsResponse>(`/groups/${slug}/announcements`),

  deleteAnnouncement: (slug: string, announcementId: string) =>
    api.delete(`/groups/${slug}/announcements/${announcementId}`),

  createEvent: (slug: string, data: { title: string; description?: string; location?: string; start_time: string; end_time?: string }) =>
    api.post<GroupEventsResponse>(`/groups/${slug}/events`, data),

  getEvents: (slug: string) =>
    api.get<GroupEventsResponse>(`/groups/${slug}/events`),

  attendEvent: (slug: string, eventId: string, status = "going") =>
    api.post(`/groups/${slug}/events/${eventId}/attend`, null, { params: { status } }),

  createPoll: (slug: string, data: { question: string; options: string[]; expires_at?: string; is_anonymous?: boolean }) =>
    api.post<GroupPollsResponse>(`/groups/${slug}/polls`, data),

  getPolls: (slug: string) =>
    api.get<GroupPollsResponse>(`/groups/${slug}/polls`),

  votePoll: (slug: string, pollId: string, optionIndex: number) =>
    api.post(`/groups/${slug}/polls/${pollId}/vote`, null, { params: { option_index: optionIndex } }),

  sendMessage: (slug: string, content: string) =>
    api.post<GroupMessagesResponse>(`/groups/${slug}/messages`, { content }),

  getMessages: (slug: string, limit = 50, offset = 0) =>
    api.get<GroupMessagesResponse>(`/groups/${slug}/messages`, {
      params: { limit, offset },
    }),

  deleteMessage: (slug: string, messageId: string) =>
    api.delete(`/groups/${slug}/messages/${messageId}`),
};
