import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupApi } from "@/services/groupApi";

export function useGroupList(query?: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["groups", "list", query, limit, offset],
    queryFn: async () => {
      const { data } = await groupApi.list(query, limit, offset);
      return data.groups;
    },
    staleTime: 30000,
  });
}

export function useMyGroups() {
  return useQuery({
    queryKey: ["groups", "my"],
    queryFn: async () => {
      const { data } = await groupApi.getMyGroups();
      return data.groups;
    },
    staleTime: 15000,
  });
}

export function useGroupDetail(slug: string) {
  return useQuery({
    queryKey: ["groups", "detail", slug],
    queryFn: async () => {
      const { data } = await groupApi.getDetail(slug);
      return data;
    },
    enabled: slug.length > 0,
    staleTime: 15000,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; privacy?: string; rules?: string }) => {
      const { data: result } = await groupApi.create(data);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useUpdateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, ...data }: { slug: string; name?: string; description?: string; cover_url?: string; privacy?: string; rules?: string }) => {
      const { data: result } = await groupApi.update(slug, data);
      return result;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["groups", "detail", vars.slug] });
    },
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      await groupApi.delete(slug);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useJoinGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, message }: { slug: string; message?: string }) => {
      const { data } = await groupApi.join(slug, message);
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["groups", "detail", vars.slug] });
      qc.invalidateQueries({ queryKey: ["groups", "my"] });
    },
  });
}

export function useLeaveGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      await groupApi.leave(slug);
    },
    onSuccess: (_, slug) => {
      qc.invalidateQueries({ queryKey: ["groups", "detail", slug] });
      qc.invalidateQueries({ queryKey: ["groups", "my"] });
    },
  });
}

export function useGroupMembers(slug: string) {
  return useQuery({
    queryKey: ["groups", "members", slug],
    queryFn: async () => {
      const { data } = await groupApi.getMembers(slug);
      return data.members;
    },
    enabled: slug.length > 0,
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, userId, role }: { slug: string; userId: string; role: string }) => {
      await groupApi.updateMemberRole(slug, userId, role);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["groups", "members", vars.slug] });
    },
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, userId }: { slug: string; userId: string }) => {
      await groupApi.removeMember(slug, userId);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["groups", "members", vars.slug] });
      qc.invalidateQueries({ queryKey: ["groups", "detail", vars.slug] });
    },
  });
}

export function useGroupJoinRequests(slug: string) {
  return useQuery({
    queryKey: ["groups", "join-requests", slug],
    queryFn: async () => {
      const { data } = await groupApi.getJoinRequests(slug);
      return data.requests;
    },
    enabled: slug.length > 0,
  });
}

export function useHandleJoinRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, requestId, status }: { slug: string; requestId: string; status: string }) => {
      await groupApi.handleJoinRequest(slug, requestId, status);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["groups", "join-requests", vars.slug] });
      qc.invalidateQueries({ queryKey: ["groups", "detail", vars.slug] });
    },
  });
}

export function useGroupAnnouncements(slug: string) {
  return useQuery({
    queryKey: ["groups", "announcements", slug],
    queryFn: async () => {
      const { data } = await groupApi.getAnnouncements(slug);
      return data.announcements;
    },
    enabled: slug.length > 0,
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, ...data }: { slug: string; title: string; content: string }) => {
      await groupApi.createAnnouncement(slug, data);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["groups", "announcements", vars.slug] });
    },
  });
}

export function useGroupEvents(slug: string) {
  return useQuery({
    queryKey: ["groups", "events", slug],
    queryFn: async () => {
      const { data } = await groupApi.getEvents(slug);
      return data.events;
    },
    enabled: slug.length > 0,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, ...data }: { slug: string; title: string; description?: string; location?: string; start_time: string; end_time?: string }) => {
      await groupApi.createEvent(slug, data);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["groups", "events", vars.slug] });
    },
  });
}

export function useAttendEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, eventId, status }: { slug: string; eventId: string; status?: string }) => {
      await groupApi.attendEvent(slug, eventId, status);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["groups", "events", vars.slug] });
    },
  });
}

export function useGroupPolls(slug: string) {
  return useQuery({
    queryKey: ["groups", "polls", slug],
    queryFn: async () => {
      const { data } = await groupApi.getPolls(slug);
      return data.polls;
    },
    enabled: slug.length > 0,
  });
}

export function useCreatePoll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, ...data }: { slug: string; question: string; options: string[]; expires_at?: string; is_anonymous?: boolean }) => {
      await groupApi.createPoll(slug, data);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["groups", "polls", vars.slug] });
    },
  });
}

export function useVotePoll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, pollId, optionIndex }: { slug: string; pollId: string; optionIndex: number }) => {
      await groupApi.votePoll(slug, pollId, optionIndex);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["groups", "polls", vars.slug] });
    },
  });
}

export function useGroupMessages(slug: string) {
  return useQuery({
    queryKey: ["groups", "messages", slug],
    queryFn: async () => {
      const { data } = await groupApi.getMessages(slug);
      return data.messages;
    },
    enabled: slug.length > 0,
    refetchInterval: 5000,
  });
}

export function useSendGroupMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, content }: { slug: string; content: string }) => {
      await groupApi.sendMessage(slug, content);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["groups", "messages", vars.slug] });
    },
  });
}
