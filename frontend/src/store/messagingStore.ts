import { create } from "zustand";
import type { Conversation, Message, WebSocketMessage, Notification } from "@/types";

interface TypingUser {
  user_id: string;
  username: string | null;
  conversation_id: string;
}

interface MessagingState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  typingUsers: TypingUser[];
  onlineUsers: Record<string, boolean>;
  ws: WebSocket | null;
  isConnected: boolean;
  notifications: Notification[];

  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  removeConversation: (conversationId: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  setTypingUsers: (conversationId: string, users: TypingUser[]) => void;
  addTypingUser: (user: TypingUser) => void;
  removeTypingUser: (userId: string, conversationId: string) => void;
  setOnlineStatus: (userId: string, isOnline: boolean) => void;
  addNotification: (notification: Notification) => void;
  connectWebSocket: (token: string) => void;
  disconnectWebSocket: () => void;
  sendWsMessage: (data: Record<string, unknown>) => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingUsers: [],
  onlineUsers: {},
  ws: null,
  isConnected: false,
  notifications: [],

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations.filter((c) => c.id !== conversation.id)],
    })),

  updateConversation: (conversationId, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, ...updates } : c
      ),
    })),

  removeConversation: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== conversationId),
      activeConversationId:
        state.activeConversationId === conversationId ? null : state.activeConversationId,
    })),

  setActiveConversation: (conversationId) =>
    set({ activeConversationId: conversationId }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),

  addMessage: (conversationId, message) =>
    set((state) => {
      const existing = state.messages[conversationId] || [];
      if (existing.some((m) => m.id === message.id)) return state;
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existing, message],
        },
      };
    }),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((m) =>
          m.id === messageId ? { ...m, ...updates } : m
        ),
      },
    })),

  removeMessage: (conversationId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).filter(
          (m) => m.id !== messageId
        ),
      },
    })),

  setTypingUsers: (conversationId, users) =>
    set((state) => ({
      typingUsers: [
        ...state.typingUsers.filter((t) => t.conversation_id !== conversationId),
        ...users,
      ],
    })),

  addTypingUser: (user) =>
    set((state) => {
      const exists = state.typingUsers.some(
        (t) => t.user_id === user.user_id && t.conversation_id === user.conversation_id
      );
      if (exists) return state;
      return { typingUsers: [...state.typingUsers, user] };
    }),

  removeTypingUser: (userId, conversationId) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter(
        (t) => !(t.user_id === userId && t.conversation_id === conversationId)
      ),
    })),

  setOnlineStatus: (userId, isOnline) =>
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [userId]: isOnline },
    })),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications.filter((n) => n.id !== notification.id)].slice(0, 50),
    })),

  connectWebSocket: (token) => {
    const { ws } = get();
    if (ws && ws.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/messaging?token=${token}`;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      set({ ws: socket, isConnected: true });
    };

    socket.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        const state = get();

        switch (data.type) {
          case "new_message":
            if (data.conversation_id && data.message) {
              state.addMessage(data.conversation_id, data.message);
              state.updateConversation(data.conversation_id, {
                last_message_at: data.message.created_at,
                last_message_content: data.message.content,
                last_message_sender_name: data.message.sender_name,
              });
            }
            break;

          case "typing":
            if (data.user_id && data.conversation_id) {
              if (data.is_typing) {
                state.addTypingUser({
                  user_id: data.user_id,
                  username: data.username || null,
                  conversation_id: data.conversation_id,
                });
              } else {
                state.removeTypingUser(data.user_id, data.conversation_id);
              }
            }
            break;

          case "message_read":
            if (data.message_id && data.user_id && data.conversation_id) {
              state.updateMessage(data.conversation_id, data.message_id, {
                read_by: [
                  ...(state.messages[data.conversation_id]?.find((m) => m.id === data.message_id)
                    ?.read_by || []),
                  { id: "", message_id: data.message_id, user_id: data.user_id, created_at: new Date().toISOString(), username: null },
                ],
              });
            }
            break;

          case "reaction":
            if (data.message_id && data.conversation_id) {
              const msgs = state.messages[data.conversation_id] || [];
              const msg = msgs.find((m) => m.id === data.message_id);
              if (msg) {
                state.updateMessage(data.conversation_id, data.message_id, {
                  reactions: [
                    ...msg.reactions.filter((r) => r.user_id !== data.user_id),
                    { id: "", message_id: data.message_id!, user_id: data.user_id!, emoji: data.emoji!, created_at: new Date().toISOString(), username: null },
                  ],
                  reactions_count: msg.reactions_count + 1,
                });
              }
            }
            break;

          case "remove_reaction":
            if (data.message_id && data.conversation_id) {
              const msgs = state.messages[data.conversation_id] || [];
              const msg = msgs.find((m) => m.id === data.message_id);
              if (msg) {
                state.updateMessage(data.conversation_id, data.message_id, {
                  reactions: msg.reactions.filter((r) => r.user_id !== data.user_id),
                  reactions_count: Math.max(0, msg.reactions_count - 1),
                });
              }
            }
            break;

          case "message_updated":
            if (data.conversation_id && data.message) {
              state.updateMessage(data.conversation_id, data.message.id, data.message);
            }
            break;

          case "message_deleted":
          case "message_unsent":
            if (data.message_id && data.conversation_id) {
              state.removeMessage(data.conversation_id, data.message_id);
            }
            break;

          case "online_status":
            if (data.user_id) {
              state.setOnlineStatus(data.user_id, data.is_online ?? false);
            }
            break;

          case "notification":
            if (data.notification) {
              state.addNotification(data.notification as Notification);
            }
            break;
        }
      } catch {
        // ignore parse errors
      }
    };

    socket.onclose = () => {
      set({ ws: null, isConnected: false });
      setTimeout(() => {
        const currentState = get();
        if (!currentState.isConnected) {
          currentState.connectWebSocket(token);
        }
      }, 3000);
    };

    socket.onerror = () => {
      set({ ws: null, isConnected: false });
    };
  },

  disconnectWebSocket: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null, isConnected: false });
    }
  },

  sendWsMessage: (data) => {
    const { ws } = get();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  },
}));
