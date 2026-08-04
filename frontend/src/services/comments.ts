import apiClient from "./api";
import type {
  Comment,
  CommentCreate,
  CommentUpdate,
  CommentReaction,
  CommentReactionCreate,
  CommentReportCreate,
  CommentListResponse,
} from "@/types";

export const commentsApi = {
  createComment: (postId: string, data: CommentCreate) =>
    apiClient.post<Comment>(`/feed/posts/${postId}/comments`, data),

  getPostComments: (postId: string, cursor?: string) =>
    apiClient.get<CommentListResponse>(`/feed/posts/${postId}/comments`, { params: { cursor } }),

  getCommentReplies: (commentId: string, cursor?: string) =>
    apiClient.get<CommentListResponse>(`/feed/comments/${commentId}/replies`, { params: { cursor } }),

  updateComment: (commentId: string, data: CommentUpdate) =>
    apiClient.put<Comment>(`/feed/comments/${commentId}`, data),

  deleteComment: (commentId: string) =>
    apiClient.delete(`/feed/comments/${commentId}`),

  pinComment: (commentId: string, postId: string) =>
    apiClient.post<Comment>(`/feed/comments/${commentId}/pin`, null, { params: { post_id: postId } }),

  unpinComment: (commentId: string, postId: string) =>
    apiClient.post<Comment>(`/feed/comments/${commentId}/unpin`, null, { params: { post_id: postId } }),

  hideComment: (commentId: string) =>
    apiClient.post<Comment>(`/feed/comments/${commentId}/hide`),

  unhideComment: (commentId: string) =>
    apiClient.post<Comment>(`/feed/comments/${commentId}/unhide`),

  toggleReaction: (commentId: string, data: CommentReactionCreate) =>
    apiClient.post<CommentReaction | null>(`/feed/comments/${commentId}/reactions`, data),

  reportComment: (commentId: string, data: CommentReportCreate) =>
    apiClient.post(`/feed/comments/${commentId}/report`, data),
};
