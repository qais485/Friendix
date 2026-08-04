import api from "./api";
import type {
  Post,
  PostCreate,
  PostUpdate,
  FeedResponse,
  FeedPosition,
  FeedPositionUpdate,
  Poll,
} from "@/types";

export const feedApi = {
  createPost: (data: PostCreate) =>
    api.post<Post>("/feed/posts", data),

  updatePost: (postId: string, data: PostUpdate) =>
    api.put<Post>(`/feed/posts/${postId}`, data),

  deletePost: (postId: string) =>
    api.delete(`/feed/posts/${postId}`),

  getPost: (postId: string) =>
    api.get<Post>(`/feed/posts/${postId}`),

  getHomeFeed: (cursor?: string) =>
    api.get<FeedResponse>("/feed/home", {
      params: { cursor },
    }),

  getFollowingFeed: (cursor?: string) =>
    api.get<FeedResponse>("/feed/following", {
      params: { cursor },
    }),

  getFriendsFeed: (cursor?: string) =>
    api.get<FeedResponse>("/feed/friends", {
      params: { cursor },
    }),

  getTrendingFeed: (cursor?: string) =>
    api.get<FeedResponse>("/feed/trending", {
      params: { cursor },
    }),

  getSuggestedPosts: () =>
    api.get<Post[]>("/feed/suggested"),

  getUserPosts: (targetUserId: string, cursor?: string) =>
    api.get<FeedResponse>(`/feed/user/${targetUserId}`, {
      params: { cursor },
    }),

  savePost: (postId: string) =>
    api.post(`/feed/posts/${postId}/save`),

  unsavePost: (postId: string) =>
    api.delete(`/feed/posts/${postId}/save`),

  getSavedPosts: () =>
    api.get<Post[]>("/feed/saved"),

  hidePost: (postId: string) =>
    api.post(`/feed/posts/${postId}/hide`),

  unhidePost: (postId: string) =>
    api.delete(`/feed/posts/${postId}/hide`),

  getHiddenPosts: () =>
    api.get<Post[]>("/feed/hidden"),

  pinPost: (postId: string) =>
    api.post<Post>(`/feed/posts/${postId}/pin`),

  unpinPost: (postId: string) =>
    api.delete<Post>(`/feed/posts/${postId}/pin`),

  archivePost: (postId: string) =>
    api.post<Post>(`/feed/posts/${postId}/archive`),

  unarchivePost: (postId: string) =>
    api.delete<Post>(`/feed/posts/${postId}/archive`),

  getArchivedPosts: () =>
    api.get<Post[]>("/feed/archived"),

  getDraftPosts: () =>
    api.get<Post[]>("/feed/drafts"),

  getScheduledPosts: () =>
    api.get<Post[]>("/feed/scheduled"),

  votePoll: (pollId: string, optionId: string) =>
    api.post<Poll>(`/feed/polls/${pollId}/vote`, null, {
      params: { option_id: optionId },
    }),

  repostPost: (postId: string, content?: string) =>
    api.post<Post>(`/feed/posts/${postId}/repost`, { content }),

  quotePost: (postId: string, quoteText: string, content?: string) =>
    api.post<Post>(`/feed/posts/${postId}/quote`, { quote_text: quoteText, content }),

  updateFeedPosition: (data: FeedPositionUpdate) =>
    api.put<FeedPosition>("/feed/position", data),

  getFeedPosition: (feedType: string) =>
    api.get<FeedPosition>(`/feed/position/${feedType}`),

  getPostCount: () =>
    api.get<{ count: number }>("/feed/count"),

  likePost: (postId: string) =>
    api.post<Post>(`/feed/posts/${postId}/like`),

  unlikePost: (postId: string) =>
    api.delete<Post>(`/feed/posts/${postId}/like`),
};
