import api from "./api";
import type {
  TrendingHashtagsResponse,
  HashtagListResponse,
  HashtagDetail,
  HashtagPostsResponse,
  FollowResponse,
  Hashtag,
} from "@/types";

export const hashtagApi = {
  getTrending: (limit = 20) =>
    api.get<TrendingHashtagsResponse>("/hashtags/trending", {
      params: { limit },
    }),

  search: (query: string, limit = 20) =>
    api.get<HashtagListResponse>("/hashtags/search", {
      params: { q: query, limit },
    }),

  getDetail: (name: string) =>
    api.get<HashtagDetail>(`/hashtags/${encodeURIComponent(name)}`),

  getPosts: (name: string, limit = 20, offset = 0) =>
    api.get<HashtagPostsResponse>(`/hashtags/${encodeURIComponent(name)}/posts`, {
      params: { limit, offset },
    }),

  follow: (name: string) =>
    api.post<FollowResponse>(`/hashtags/${encodeURIComponent(name)}/follow`),

  unfollow: (name: string) =>
    api.delete<FollowResponse>(`/hashtags/${encodeURIComponent(name)}/follow`),

  getFollowed: (limit = 50) =>
    api.get<HashtagListResponse>("/hashtags/followed", {
      params: { limit },
    }),

  create: (name: string, description?: string) =>
    api.post<Hashtag>("/hashtags", { name, description }),
};
