import api from "./api";
import type {
  EventListResponse,
  EventDetailResponse,
  Event,
  EventRSVPListResponse,
  EventInvitesResponse,
  EventChatMessagesResponse,
} from "@/types";

export const eventApi = {
  list: (q?: string, limit = 20, offset = 0) =>
    api.get<EventListResponse>("/events", { params: { q, limit, offset } }),

  getMyEvents: () =>
    api.get<EventListResponse>("/events/my"),

  getCreatedEvents: () =>
    api.get<EventListResponse>("/events/created"),

  getMyInvites: () =>
    api.get<EventInvitesResponse>("/events/invites"),

  getDetail: (id: string) =>
    api.get<EventDetailResponse>(`/events/${id}`),

  create: (data: { title: string; description?: string; event_type?: string; location?: string; online_link?: string; start_time: string; end_time?: string; reminder_minutes?: number }) =>
    api.post<Event>("/events", data),

  update: (id: string, data: { title?: string; description?: string; cover_url?: string; event_type?: string; location?: string; online_link?: string; start_time?: string; end_time?: string; reminder_minutes?: number }) =>
    api.put<Event>(`/events/${id}`, data),

  delete: (id: string) =>
    api.delete(`/events/${id}`),

  cancel: (id: string) =>
    api.post(`/events/${id}/cancel`),

  rsvp: (id: string, status = "going") =>
    api.post(`/events/${id}/rsvp`, null, { params: { status } }),

  getAttendees: (id: string) =>
    api.get<EventRSVPListResponse>(`/events/${id}/attendees`),

  invite: (id: string, userIds: string[]) =>
    api.post(`/events/${id}/invite`, { user_ids: userIds }),

  getInvites: (id: string) =>
    api.get<EventInvitesResponse>(`/events/${id}/invites`),

  handleInvite: (inviteId: string, status: string) =>
    api.put(`/events/invites/${inviteId}`, null, { params: { status } }),

  sendChat: (id: string, content: string) =>
    api.post<EventChatMessagesResponse>(`/events/${id}/chat`, { content }),

  getChat: (id: string, limit = 50, offset = 0) =>
    api.get<EventChatMessagesResponse>(`/events/${id}/chat`, { params: { limit, offset } }),

  deleteChatMessage: (eventId: string, messageId: string) =>
    api.delete(`/events/${eventId}/chat/${messageId}`),
};
