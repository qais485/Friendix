import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { liveApi } from "@/services/live";
import type {
  LiveStreamCreate,
  LiveStreamUpdate,
  LiveStreamListResponse,
  LiveChatMessageListResponse,
  LiveDonationListResponse,
  LiveScheduleRequest,
  LiveChatMessageCreate,
  LiveReactionCreate,
  LiveDonationCreate,
  LiveGuestCreate,
  LiveModeratorCreate,
} from "@/types";

export function useActiveStreams() {
  return useInfiniteQuery({
    queryKey: ["live", "active"],
    queryFn: async ({ pageParam }) => {
      const { data } = await liveApi.getActiveStreams(pageParam);
      return data;
    },
    getNextPageParam: (lastPage: LiveStreamListResponse) => lastPage.has_more ? lastPage.streams[lastPage.streams.length - 1]?.id : undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useScheduledStreams() {
  return useInfiniteQuery({
    queryKey: ["live", "scheduled"],
    queryFn: async ({ pageParam }) => {
      const { data } = await liveApi.getScheduledStreams(pageParam);
      return data;
    },
    getNextPageParam: (lastPage: LiveStreamListResponse) => lastPage.has_more ? lastPage.streams[lastPage.streams.length - 1]?.id : undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useReplays() {
  return useInfiniteQuery({
    queryKey: ["live", "replays"],
    queryFn: async ({ pageParam }) => {
      const { data } = await liveApi.getReplays(pageParam);
      return data;
    },
    getNextPageParam: (lastPage: LiveStreamListResponse) => lastPage.has_more ? lastPage.streams[lastPage.streams.length - 1]?.id : undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useMyStreams() {
  return useInfiniteQuery({
    queryKey: ["live", "my"],
    queryFn: async ({ pageParam }) => {
      const { data } = await liveApi.getMyStreams(pageParam);
      return data;
    },
    getNextPageParam: (lastPage: LiveStreamListResponse) => lastPage.has_more ? lastPage.streams[lastPage.streams.length - 1]?.id : undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useLiveStream(streamId: string | undefined) {
  return useQuery({
    queryKey: ["live", "stream", streamId],
    queryFn: async () => {
      const { data } = await liveApi.getStream(streamId!);
      return data;
    },
    enabled: !!streamId,
  });
}

export function useCreateLiveStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LiveStreamCreate) => {
      const { data: stream } = await liveApi.createStream(data);
      return stream;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live"] });
    },
  });
}

export function useUpdateLiveStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ streamId, data }: { streamId: string; data: LiveStreamUpdate }) => {
      const { data: stream } = await liveApi.updateStream(streamId, data);
      return stream;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["live", "stream", variables.streamId] });
      queryClient.invalidateQueries({ queryKey: ["live"] });
    },
  });
}

export function useDeleteLiveStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamId: string) => {
      await liveApi.deleteStream(streamId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live"] });
    },
  });
}

export function useGoLive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamId: string) => {
      const { data: stream } = await liveApi.goLive(streamId);
      return stream;
    },
    onSuccess: (_data, streamId) => {
      queryClient.invalidateQueries({ queryKey: ["live", "stream", streamId] });
      queryClient.invalidateQueries({ queryKey: ["live"] });
    },
  });
}

export function useEndStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamId: string) => {
      const { data: stream } = await liveApi.endStream(streamId);
      return stream;
    },
    onSuccess: (_data, streamId) => {
      queryClient.invalidateQueries({ queryKey: ["live", "stream", streamId] });
      queryClient.invalidateQueries({ queryKey: ["live"] });
    },
  });
}

export function useScheduleStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ streamId, data }: { streamId: string; data: LiveScheduleRequest }) => {
      const { data: stream } = await liveApi.scheduleStream(streamId, data);
      return stream;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["live", "stream", variables.streamId] });
      queryClient.invalidateQueries({ queryKey: ["live"] });
    },
  });
}

export function useJoinStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamId: string) => {
      const { data: stream } = await liveApi.joinStream(streamId);
      return stream;
    },
    onSuccess: (_data, streamId) => {
      queryClient.invalidateQueries({ queryKey: ["live", "stream", streamId] });
    },
  });
}

export function useLeaveStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamId: string) => {
      const { data: stream } = await liveApi.leaveStream(streamId);
      return stream;
    },
    onSuccess: (_data, streamId) => {
      queryClient.invalidateQueries({ queryKey: ["live", "stream", streamId] });
    },
  });
}

export function useChatMessages(streamId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["live", "chat", streamId],
    queryFn: async ({ pageParam }) => {
      const { data } = await liveApi.getChatMessages(streamId!, pageParam);
      return data;
    },
    getNextPageParam: (lastPage: LiveChatMessageListResponse) => lastPage.has_more ? lastPage.messages[lastPage.messages.length - 1]?.id : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!streamId,
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ streamId, data }: { streamId: string; data: LiveChatMessageCreate }) => {
      const { data: message } = await liveApi.sendChatMessage(streamId, data);
      return message;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["live", "chat", variables.streamId] });
    },
  });
}

export function useSendReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ streamId, data }: { streamId: string; data: LiveReactionCreate }) => {
      const { data: reaction } = await liveApi.sendReaction(streamId, data);
      return reaction;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["live", "stream", variables.streamId] });
    },
  });
}

export function useSendDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ streamId, data }: { streamId: string; data: LiveDonationCreate }) => {
      const { data: donation } = await liveApi.sendDonation(streamId, data);
      return donation;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["live", "donations", variables.streamId] });
      queryClient.invalidateQueries({ queryKey: ["live", "stream", variables.streamId] });
    },
  });
}

export function useDonations(streamId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["live", "donations", streamId],
    queryFn: async ({ pageParam }) => {
      const { data } = await liveApi.getDonations(streamId!, pageParam);
      return data;
    },
    getNextPageParam: (lastPage: LiveDonationListResponse) => lastPage.has_more ? lastPage.donations[lastPage.donations.length - 1]?.id : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!streamId,
  });
}

export function useInviteGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ streamId, data }: { streamId: string; data: LiveGuestCreate }) => {
      const { data: guest } = await liveApi.inviteGuest(streamId, data);
      return guest;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["live", "guests", variables.streamId] });
    },
  });
}

export function useAcceptGuestInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamId: string) => {
      const { data: guest } = await liveApi.acceptGuestInvite(streamId);
      return guest;
    },
    onSuccess: (_data, streamId) => {
      queryClient.invalidateQueries({ queryKey: ["live", "guests", streamId] });
      queryClient.invalidateQueries({ queryKey: ["live", "stream", streamId] });
    },
  });
}

export function useRejectGuestInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamId: string) => {
      const { data: guest } = await liveApi.rejectGuestInvite(streamId);
      return guest;
    },
    onSuccess: (_data, streamId) => {
      queryClient.invalidateQueries({ queryKey: ["live", "guests", streamId] });
      queryClient.invalidateQueries({ queryKey: ["live", "stream", streamId] });
    },
  });
}

export function useRemoveGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ streamId, guestUserId }: { streamId: string; guestUserId: string }) => {
      const { data: guest } = await liveApi.removeGuest(streamId, guestUserId);
      return guest;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["live", "guests", variables.streamId] });
      queryClient.invalidateQueries({ queryKey: ["live", "stream", variables.streamId] });
    },
  });
}

export function useGuests(streamId: string | undefined) {
  return useQuery({
    queryKey: ["live", "guests", streamId],
    queryFn: async () => {
      const { data } = await liveApi.getGuests(streamId!);
      return data;
    },
    enabled: !!streamId,
  });
}

export function useAddModerator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ streamId, data }: { streamId: string; data: LiveModeratorCreate }) => {
      const { data: moderator } = await liveApi.addModerator(streamId, data);
      return moderator;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["live", "moderators", variables.streamId] });
    },
  });
}

export function useRemoveModerator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ streamId, moderatorUserId }: { streamId: string; moderatorUserId: string }) => {
      await liveApi.removeModerator(streamId, moderatorUserId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["live", "moderators", variables.streamId] });
    },
  });
}

export function useModerators(streamId: string | undefined) {
  return useQuery({
    queryKey: ["live", "moderators", streamId],
    queryFn: async () => {
      const { data } = await liveApi.getModerators(streamId!);
      return data;
    },
    enabled: !!streamId,
  });
}

export function useStartRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamId: string) => {
      const { data: stream } = await liveApi.startRecording(streamId);
      return stream;
    },
    onSuccess: (_data, streamId) => {
      queryClient.invalidateQueries({ queryKey: ["live", "stream", streamId] });
      queryClient.invalidateQueries({ queryKey: ["live"] });
    },
  });
}

export function useStopRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamId: string) => {
      const { data: stream } = await liveApi.stopRecording(streamId);
      return stream;
    },
    onSuccess: (_data, streamId) => {
      queryClient.invalidateQueries({ queryKey: ["live", "stream", streamId] });
      queryClient.invalidateQueries({ queryKey: ["live"] });
    },
  });
}
