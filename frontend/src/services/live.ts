import apiClient from "./api";
import type {
  LiveStream,
  LiveStreamCreate,
  LiveStreamUpdate,
  LiveStreamListResponse,
  LiveChatMessage,
  LiveChatMessageCreate,
  LiveChatMessageListResponse,
  LiveReaction,
  LiveReactionCreate,
  LiveDonation,
  LiveDonationCreate,
  LiveDonationListResponse,
  LiveGuest,
  LiveGuestCreate,
  LiveModerator,
  LiveModeratorCreate,
  LiveScheduleRequest,
} from "@/types";

export const liveApi = {
  createStream: (data: LiveStreamCreate) =>
    apiClient.post<LiveStream>("/live", data),

  getActiveStreams: (cursor?: string) =>
    apiClient.get<LiveStreamListResponse>("/live", { params: { cursor } }),

  getScheduledStreams: (cursor?: string) =>
    apiClient.get<LiveStreamListResponse>("/live/scheduled", { params: { cursor } }),

  getReplays: (cursor?: string) =>
    apiClient.get<LiveStreamListResponse>("/live/replays", { params: { cursor } }),

  getMyStreams: (cursor?: string) =>
    apiClient.get<LiveStreamListResponse>("/live/my", { params: { cursor } }),

  getStream: (streamId: string) =>
    apiClient.get<LiveStream>(`/live/${streamId}`),

  updateStream: (streamId: string, data: LiveStreamUpdate) =>
    apiClient.put<LiveStream>(`/live/${streamId}`, data),

  deleteStream: (streamId: string) =>
    apiClient.delete(`/live/${streamId}`),

  goLive: (streamId: string) =>
    apiClient.post<LiveStream>(`/live/${streamId}/go-live`),

  endStream: (streamId: string) =>
    apiClient.post<LiveStream>(`/live/${streamId}/end`),

  scheduleStream: (streamId: string, data: LiveScheduleRequest) =>
    apiClient.post<LiveStream>(`/live/${streamId}/schedule`, data),

  joinStream: (streamId: string) =>
    apiClient.post<LiveStream>(`/live/${streamId}/join`),

  leaveStream: (streamId: string) =>
    apiClient.post<LiveStream>(`/live/${streamId}/leave`),

  getChatMessages: (streamId: string, cursor?: string) =>
    apiClient.get<LiveChatMessageListResponse>(`/live/${streamId}/chat`, { params: { cursor } }),

  sendChatMessage: (streamId: string, data: LiveChatMessageCreate) =>
    apiClient.post<LiveChatMessage>(`/live/${streamId}/chat`, data),

  sendReaction: (streamId: string, data: LiveReactionCreate) =>
    apiClient.post<LiveReaction>(`/live/${streamId}/reactions`, data),

  sendDonation: (streamId: string, data: LiveDonationCreate) =>
    apiClient.post<LiveDonation>(`/live/${streamId}/donations`, data),

  getDonations: (streamId: string, cursor?: string) =>
    apiClient.get<LiveDonationListResponse>(`/live/${streamId}/donations`, { params: { cursor } }),

  inviteGuest: (streamId: string, data: LiveGuestCreate) =>
    apiClient.post<LiveGuest>(`/live/${streamId}/guests/invite`, data),

  acceptGuestInvite: (streamId: string) =>
    apiClient.post<LiveGuest>(`/live/${streamId}/guests/accept`),

  rejectGuestInvite: (streamId: string) =>
    apiClient.post<LiveGuest>(`/live/${streamId}/guests/reject`),

  removeGuest: (streamId: string, guestUserId: string) =>
    apiClient.delete<LiveGuest>(`/live/${streamId}/guests/${guestUserId}`),

  getGuests: (streamId: string) =>
    apiClient.get<LiveGuest[]>(`/live/${streamId}/guests`),

  addModerator: (streamId: string, data: LiveModeratorCreate) =>
    apiClient.post<LiveModerator>(`/live/${streamId}/moderators`, data),

  removeModerator: (streamId: string, moderatorUserId: string) =>
    apiClient.delete(`/live/${streamId}/moderators/${moderatorUserId}`),

  getModerators: (streamId: string) =>
    apiClient.get<LiveModerator[]>(`/live/${streamId}/moderators`),

  startRecording: (streamId: string) =>
    apiClient.post<LiveStream>(`/live/${streamId}/record`),

  stopRecording: (streamId: string) =>
    apiClient.post<LiveStream>(`/live/${streamId}/stop-record`),
};
