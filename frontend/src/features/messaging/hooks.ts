import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "@/services/messagingApi";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { ConversationCreate, ConversationUpdate, MessageCreate, MessageUpdate } from "@/types";

export function useConversations() {
  return useQuery({
    queryKey: ["messaging", "conversations"],
    queryFn: async () => {
      const { data } = await messagingApi.getConversations();
      return data;
    },
  });
}

export function useConversation(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["messaging", "conversation", conversationId],
    queryFn: async () => {
      const { data } = await messagingApi.getConversation(conversationId!);
      return data;
    },
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ConversationCreate) => {
      const { data: conversation } = await messagingApi.createConversation(data);
      return conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "conversations"] });
    },
  });
}

export function useUpdateConversation(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ConversationUpdate) => {
      const { data: conversation } = await messagingApi.updateConversation(conversationId, data);
      return conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messaging", "conversation", conversationId] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      await messagingApi.deleteConversation(conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "conversations"] });
    },
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["messaging", "messages", conversationId],
    queryFn: async () => {
      const { data } = await messagingApi.getMessages(conversationId!);
      return data;
    },
    enabled: !!conversationId,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: MessageCreate) => {
      const { data: message } = await messagingApi.sendMessage(conversationId, data);
      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["messaging", "conversations"] });
    },
  });
}

export function useUpdateMessage(messageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: MessageUpdate) => {
      const { data: message } = await messagingApi.updateMessage(messageId, data);
      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "messages"] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      await messagingApi.deleteMessage(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "messages"] });
    },
  });
}

export function useUnsendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      await messagingApi.unsendMessage(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "messages"] });
    },
  });
}

export function useAddReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      await messagingApi.addReaction(messageId, emoji);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "messages"] });
    },
  });
}

export function useRemoveReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      await messagingApi.removeReaction(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "messages"] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      await messagingApi.markAsRead(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "messages"] });
      queryClient.invalidateQueries({ queryKey: ["messaging", "conversations"] });
    },
  });
}

export function useTogglePin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, isPinned }: { conversationId: string; isPinned: boolean }) => {
      await messagingApi.togglePin(conversationId, isPinned);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "conversations"] });
    },
  });
}

export function useToggleArchive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, isArchived }: { conversationId: string; isArchived: boolean }) => {
      await messagingApi.toggleArchive(conversationId, isArchived);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "conversations"] });
    },
  });
}

export function useToggleMute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, isMuted }: { conversationId: string; isMuted: boolean }) => {
      await messagingApi.toggleMute(conversationId, isMuted);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "conversations"] });
    },
  });
}

export function usePinnedConversations() {
  return useQuery({
    queryKey: ["messaging", "pinned"],
    queryFn: async () => {
      const { data } = await messagingApi.getPinnedConversations();
      return data;
    },
  });
}

export function useArchivedConversations() {
  return useQuery({
    queryKey: ["messaging", "archived"],
    queryFn: async () => {
      const { data } = await messagingApi.getArchivedConversations();
      return data;
    },
  });
}

export function useSearchMessages(query: string, conversationId?: string) {
  return useQuery({
    queryKey: ["messaging", "search", query, conversationId],
    queryFn: async () => {
      const { data } = await messagingApi.searchMessages(query, conversationId);
      return data;
    },
    enabled: query.length > 0,
  });
}

export function useOnlineStatus(userId: string | undefined) {
  return useQuery({
    queryKey: ["messaging", "online", userId],
    queryFn: async () => {
      const { data } = await messagingApi.getOnlineStatus(userId!);
      return data;
    },
    enabled: !!userId,
    refetchInterval: 30000,
    staleTime: 0,
  });
}

export function useForwardMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, conversationId }: { messageId: string; conversationId: string }) => {
      const { data } = await messagingApi.forwardMessage(messageId, [conversationId]);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messaging", "conversations"] });
    },
  });
}

export function useUploadMedia() {
  return useMutation({
    mutationFn: async (file: File) => {
      const resourceType = file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
        ? "video"
        : "image";
      const result = await uploadToCloudinary(file, resourceType);
      return result;
    },
  });
}
