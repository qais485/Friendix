import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchApi } from "@/services/searchApi";
import type { SearchType, SearchFilters } from "@/types";

export function useSearch(query: string, searchType: SearchType = "all", filters?: SearchFilters) {
  return useQuery({
    queryKey: ["search", query, searchType, filters],
    queryFn: async () => {
      const { data } = await searchApi.search(query, searchType, filters);
      return data;
    },
    enabled: query.length > 0,
    staleTime: 30000,
  });
}

export function useSearchHistory() {
  return useQuery({
    queryKey: ["search", "history"],
    queryFn: async () => {
      const { data } = await searchApi.getHistory();
      return data;
    },
  });
}

export function useClearSearchHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await searchApi.clearHistory();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search", "history"] });
    },
  });
}

export function useSaveSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { query: string; search_type: string; filters_json?: string; label?: string }) => {
      const { data: result } = await searchApi.saveSearch(data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search", "saved"] });
    },
  });
}

export function useSavedSearches() {
  return useQuery({
    queryKey: ["search", "saved"],
    queryFn: async () => {
      const { data } = await searchApi.getSavedSearches();
      return data;
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (searchId: string) => {
      await searchApi.deleteSavedSearch(searchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search", "saved"] });
    },
  });
}
