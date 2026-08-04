import api from "./api";
import type {
  Conversation,
  ConversationCreate,
  ConversationUpdate,
  Message,
  MessageCreate,
  MessageUpdate,
  MessageSearchResult,
  OnlineStatus,
} from "@/types";

export const messagingApi = {
  getConversations: () =>
    api.get<Conversation[]>("/messaging/conversations"),

  createConversation: (data: ConversationCreate) =>
    api.post<Conversation>("/messaging/conversations", data),

  getConversation: (conversationId: string) =>
    api.get<Conversation>(`/messaging/conversations/${conversationId}`),

  updateConversation: (conversationId: string, data: ConversationUpdate) =>
    api.put<Conversation>(`/messaging/conversations/${conversationId}`, data),

  deleteConversation: (conversationId: string) =>
    api.delete(`/messaging/conversations/${conversationId}`),

  addMembers: (conversationId: string, userIds: string[]) =>
    api.post<Conversation>(`/messaging/conversations/${conversationId}/members`, userIds),

  removeMember: (conversationId: string, targetUserId: string) =>
    api.delete(`/messaging/conversations/${conversationId}/members/${targetUserId}`),

  getPinnedConversations: () =>
    api.get<Conversation[]>("/messaging/conversations/pinned"),

  getArchivedConversations: () =>
    api.get<Conversation[]>("/messaging/conversations/archived"),

  togglePin: (conversationId: string, isPinned: boolean) =>
    api.put(`/messaging/conversations/${conversationId}/pin`, { is_pinned: isPinned }),

  toggleArchive: (conversationId: string, isArchived: boolean) =>
    api.put(`/messaging/conversations/${conversationId}/archive`, { is_archived: isArchived }),

  toggleMute: (conversationId: string, isMuted: boolean) =>
    api.put(`/messaging/conversations/${conversationId}/mute`, { is_muted: isMuted }),

  getMessages: (conversationId: string, limit = 50, offset = 0) =>
    api.get<Message[]>(`/messaging/conversations/${conversationId}/messages`, {
      params: { limit, offset },
    }),

  sendMessage: (conversationId: string, data: MessageCreate) =>
    api.post<Message>(`/messaging/conversations/${conversationId}/messages`, data),

  updateMessage: (messageId: string, data: MessageUpdate) =>
    api.put<Message>(`/messaging/messages/${messageId}`, data),

  deleteMessage: (messageId: string) =>
    api.delete(`/messaging/messages/${messageId}`),

  unsendMessage: (messageId: string) =>
    api.post(`/messaging/messages/${messageId}/unsend`),

  forwardMessage: (messageId: string, conversationIds: string[]) =>
    api.post<Message[]>(`/messaging/messages/${messageId}/forward`, {
      conversation_ids: conversationIds,
    }),

  addReaction: (messageId: string, emoji: string) =>
    api.post(`/messaging/messages/${messageId}/reactions`, { emoji }),

  removeReaction: (messageId: string) =>
    api.delete(`/messaging/messages/${messageId}/reactions`),

  markAsRead: (messageId: string) =>
    api.post(`/messaging/messages/${messageId}/read`),

  getReadReceipts: (messageId: string) =>
    api.get(`/messaging/messages/${messageId}/read-receipts`),

  setTyping: (conversationId: string, isTyping = true) =>
    api.post(`/messaging/conversations/${conversationId}/typing`, null, {
      params: { is_typing: isTyping },
    }),

  getTypingUsers: (conversationId: string) =>
    api.get(`/messaging/conversations/${conversationId}/typing`),

  updateOnlineStatus: (isOnline: boolean, statusText?: string) =>
    api.put("/messaging/online-status", {
      is_online: isOnline,
      status_text: statusText,
    }),

  getOnlineStatus: (targetUserId: string) =>
    api.get<OnlineStatus>(`/messaging/online-status/${targetUserId}`),

  searchMessages: (query: string, conversationId?: string, limit = 50, offset = 0) =>
    api.get<MessageSearchResult>("/messaging/search", {
      params: { q: query, conversation_id: conversationId, limit, offset },
    }),
};
