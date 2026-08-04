export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  mentions: string[] | null;
  is_pinned: boolean;
  is_hidden: boolean;
  is_deleted: boolean;
  replies_count: number;
  reactions_count: number;
  author?: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  };
  reactions: CommentReaction[];
  has_reacted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentReaction {
  id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  };
}

export interface CommentReport {
  id: string;
  comment_id: string;
  reporter_id: string;
  reason: "spam" | "harassment" | "inappropriate" | "other";
  description: string | null;
  status: string;
  created_at: string;
}

export interface CommentCreate {
  content: string;
  parent_id?: string;
  mentions?: string[];
}

export interface CommentUpdate {
  content: string;
}

export interface CommentReactionCreate {
  emoji: string;
}

export interface CommentReportCreate {
  reason: "spam" | "harassment" | "inappropriate" | "other";
  description?: string;
}

export interface CommentListResponse {
  comments: Comment[];
  total: number;
  has_more: boolean;
}
