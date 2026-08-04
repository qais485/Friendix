import api from "./api";
import type {
  UnifiedSearchResponse,
  SearchHistoryListResponse,
  SavedSearchListResponse,
  SavedSearchItem,
  SearchType,
  SearchFilters,
} from "@/types";

export const searchApi = {
  search: (
    query: string,
    searchType: SearchType = "all",
    filters?: SearchFilters,
    limit = 20
  ) =>
    api.get<UnifiedSearchResponse>("/search", {
      params: {
        q: query,
        type: searchType,
        post_type: filters?.post_type,
        date_from: filters?.date_from,
        date_to: filters?.date_to,
        limit,
      },
    }),

  getHistory: (limit = 20) =>
    api.get<SearchHistoryListResponse>("/search/history", {
      params: { limit },
    }),

  clearHistory: () =>
    api.delete("/search/history"),

  saveSearch: (data: { query: string; search_type: string; filters_json?: string; label?: string }) =>
    api.post<SavedSearchItem>("/search/save", data),

  getSavedSearches: () =>
    api.get<SavedSearchListResponse>("/search/saved"),

  deleteSavedSearch: (searchId: string) =>
    api.delete(`/search/saved/${searchId}`),
};
