import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventApi } from "@/services/eventApi";

export function useEventList(query?: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["events", "list", query, limit, offset],
    queryFn: async () => {
      const { data } = await eventApi.list(query, limit, offset);
      return data.events;
    },
    staleTime: 30000,
  });
}

export function useMyEvents() {
  return useQuery({
    queryKey: ["events", "my"],
    queryFn: async () => {
      const { data } = await eventApi.getMyEvents();
      return data.events;
    },
    staleTime: 15000,
  });
}

export function useMyInvites() {
  return useQuery({
    queryKey: ["events", "invites"],
    queryFn: async () => {
      const { data } = await eventApi.getMyInvites();
      return data.invites;
    },
    staleTime: 15000,
  });
}

export function useEventDetail(id: string) {
  return useQuery({
    queryKey: ["events", "detail", id],
    queryFn: async () => {
      const { data } = await eventApi.getDetail(id);
      return data;
    },
    enabled: id.length > 0,
    staleTime: 15000,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; event_type?: string; location?: string; online_link?: string; start_time: string; end_time?: string; reminder_minutes?: number }) => {
      const { data: result } = await eventApi.create(data);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; description?: string; cover_url?: string; event_type?: string; location?: string; online_link?: string; start_time?: string; end_time?: string; reminder_minutes?: number }) => {
      const { data: result } = await eventApi.update(id, data);
      return result;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["events", "detail", vars.id] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await eventApi.delete(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useCancelEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await eventApi.cancel(id);
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["events", "detail", id] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useRSVPEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await eventApi.rsvp(id, status);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["events", "detail", vars.id] });
      qc.invalidateQueries({ queryKey: ["events", "my"] });
      qc.invalidateQueries({ queryKey: ["events", "list"] });
    },
  });
}

export function useEventAttendees(id: string) {
  return useQuery({
    queryKey: ["events", "attendees", id],
    queryFn: async () => {
      const { data } = await eventApi.getAttendees(id);
      return data.attendees;
    },
    enabled: id.length > 0,
  });
}

export function useInviteToEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userIds }: { id: string; userIds: string[] }) => {
      await eventApi.invite(id, userIds);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["events", "invites", vars.id] });
    },
  });
}

export function useHandleInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ inviteId, status }: { inviteId: string; status: string }) => {
      await eventApi.handleInvite(inviteId, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events", "invites"] });
      qc.invalidateQueries({ queryKey: ["events", "my"] });
    },
  });
}

export function useEventChat(id: string) {
  return useQuery({
    queryKey: ["events", "chat", id],
    queryFn: async () => {
      const { data } = await eventApi.getChat(id);
      return data.messages;
    },
    enabled: id.length > 0,
    refetchInterval: 5000,
  });
}

export function useSendEventChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      await eventApi.sendChat(id, content);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["events", "chat", vars.id] });
    },
  });
}
