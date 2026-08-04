export interface ConversationMember {
  id: string;
  user_id: string;
  role: "admin" | "member";
  is_muted: boolean;
  is_notifications_paused: boolean;
  is_pinned: boolean;
  is_archived: boolean;
  last_read_at: string | null;
  joined_at: string;
  is_left: boolean;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_online: boolean;
  last_seen_at: string | null;
}

export interface Conversation {
  id: string;
  title: string | null;
  is_group: boolean;
  group_photo_url: string | null;
  created_by_id: string | null;
  last_message_id: string | null;
  last_message_at: string | null;
  is_archived: boolean;
  is_pinned: boolean;
  chat_theme: string;
  created_at: string;
  updated_at: string;
  members: ConversationMember[];
  unread_count: number;
  last_message_content: string | null;
  last_message_sender_name: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  content: string | null;
  message_type: "text" | "image" | "video" | "audio" | "file" | "voice" | "gif" | "sticker" | "system";
  media_url: string | null;
  media_id: string | null;
  thumbnail_url: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  duration: number | null;
  reply_to_id: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  is_unsent: boolean;
  reactions_count: number;
  reply_count: number;
  is_forwarded: boolean;
  forwarded_from_id: string | null;
  metadata_json: string | null;
  created_at: string;
  updated_at: string;
  sender_name: string | null;
  sender_avatar: string | null;
  reactions: MessageReaction[];
  read_by: MessageRead[];
  reply_to_preview?: Message | null;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  username: string | null;
}

export interface MessageRead {
  id: string;
  message_id: string;
  user_id: string;
  created_at: string;
  username: string | null;
}

export interface TypingIndicator {
  user_id: string;
  conversation_id: string;
  is_typing: boolean;
  username: string | null;
  created_at: string;
}

export interface OnlineStatus {
  user_id: string;
  is_online: boolean;
  last_seen_at: string | null;
  status_text: string | null;
}

export interface ConversationCreate {
  participant_ids: string[];
  title?: string;
  is_group?: boolean;
}

export interface ConversationUpdate {
  title?: string;
  group_photo_url?: string;
  chat_theme?: string;
  is_pinned?: boolean;
  is_archived?: boolean;
}

export interface MessageCreate {
  content?: string;
  message_type?: string;
  media_url?: string;
  media_id?: string;
  thumbnail_url?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  duration?: number;
  reply_to_id?: string;
  metadata_json?: string;
}

export interface MessageUpdate {
  content?: string;
  is_edited?: boolean;
}

export interface MessageSearchResult {
  messages: Message[];
  total_count: number;
}

export interface WebSocketMessage {
  type: string;
  conversation_id?: string;
  message?: Message;
  user_id?: string;
  username?: string;
  is_typing?: boolean;
  is_online?: boolean;
  message_id?: string;
  emoji?: string;
  content?: string;
  notification?: {
    id: string;
    type: string;
    entity_type: string;
    entity_id: string;
    content: string | null;
    created_at: string;
    actor?: {
      id: string;
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
    };
  };
}
