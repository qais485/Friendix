import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { commentsApi } from "@/services/comments";
import type {
  CommentCreate,
  CommentUpdate,
  CommentReactionCreate,
  CommentReportCreate,
  CommentListResponse,
  Comment,
} from "@/types";

export function usePostComments(postId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["comments", "post", postId],
    queryFn: async ({ pageParam }) => {
      const { data } = await commentsApi.getPostComments(postId!, pageParam);
      return data;
    },
    getNextPageParam: (lastPage: CommentListResponse) => lastPage.has_more ? lastPage.comments[lastPage.comments.length - 1]?.id : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!postId,
  });
}

export function useCommentReplies(commentId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["comments", "replies", commentId],
    queryFn: async ({ pageParam }) => {
      const { data } = await commentsApi.getCommentReplies(commentId!, pageParam);
      return data;
    },
    getNextPageParam: (lastPage: CommentListResponse) => lastPage.has_more ? lastPage.comments[lastPage.comments.length - 1]?.id : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!commentId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, data }: { postId: string; data: CommentCreate }) => {
      const { data: comment } = await commentsApi.createComment(postId, data);
      return comment;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", "post", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, data }: { commentId: string; data: CommentUpdate }) => {
      const { data: comment } = await commentsApi.updateComment(commentId, data);
      return comment;
    },
    onMutate: async ({ commentId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });
      const previous = queryClient.getQueriesData({ queryKey: ["comments"] });

      queryClient.setQueriesData({ queryKey: ["comments"] }, (old: CommentListResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.map((comment) =>
            comment.id === commentId ? { ...comment, ...(data as Partial<Comment>) } : comment
          ),
        };
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      await commentsApi.deleteComment(commentId);
    },
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });
      const previous = queryClient.getQueriesData({ queryKey: ["comments"] });

      queryClient.setQueriesData({ queryKey: ["comments"] }, (old: CommentListResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.filter((comment) => comment.id !== commentId),
        };
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function usePinComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string; postId: string }) => {
      const { data: comment } = await commentsApi.pinComment(commentId, postId);
      return comment;
    },
    onMutate: async ({ commentId }) => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });
      const previous = queryClient.getQueriesData({ queryKey: ["comments"] });

      queryClient.setQueriesData({ queryKey: ["comments"] }, (old: CommentListResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.map((comment) => ({
            ...comment,
            is_pinned: comment.id === commentId ? true : comment.is_pinned,
          })),
        };
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useUnpinComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string; postId: string }) => {
      const { data: comment } = await commentsApi.unpinComment(commentId, postId);
      return comment;
    },
    onMutate: async ({ commentId }) => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });
      const previous = queryClient.getQueriesData({ queryKey: ["comments"] });

      queryClient.setQueriesData({ queryKey: ["comments"] }, (old: CommentListResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.map((comment) => ({
            ...comment,
            is_pinned: comment.id === commentId ? false : comment.is_pinned,
          })),
        };
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useHideComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { data: comment } = await commentsApi.hideComment(commentId);
      return comment;
    },
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });
      const previous = queryClient.getQueriesData({ queryKey: ["comments"] });

      queryClient.setQueriesData({ queryKey: ["comments"] }, (old: CommentListResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.map((comment) =>
            comment.id === commentId ? { ...comment, is_hidden: true } : comment
          ),
        };
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useUnhideComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { data: comment } = await commentsApi.unhideComment(commentId);
      return comment;
    },
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });
      const previous = queryClient.getQueriesData({ queryKey: ["comments"] });

      queryClient.setQueriesData({ queryKey: ["comments"] }, (old: CommentListResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.map((comment) =>
            comment.id === commentId ? { ...comment, is_hidden: false } : comment
          ),
        };
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useToggleCommentReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, data }: { commentId: string; data: CommentReactionCreate }) => {
      const { data: reaction } = await commentsApi.toggleReaction(commentId, data);
      return reaction;
    },
    onMutate: async ({ commentId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });
      const previous = queryClient.getQueriesData({ queryKey: ["comments"] });

      queryClient.setQueriesData({ queryKey: ["comments"] }, (old: CommentListResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.map((comment) => {
            if (comment.id !== commentId) return comment;
            const existingReaction = comment.reactions?.find(
              (r) => r.emoji === data.emoji
            );
            if (existingReaction) {
              return {
                ...comment,
                reactions: comment.reactions?.filter((r) => r.id !== existingReaction.id),
                reactions_count: Math.max(0, (comment.reactions_count || 1) - 1),
                has_reacted: false,
              };
            }
            return {
              ...comment,
              reactions: [...(comment.reactions || []), { id: "temp", emoji: data.emoji } as any],
              reactions_count: (comment.reactions_count || 0) + 1,
              has_reacted: true,
            };
          }),
        };
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useReportComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, data }: { commentId: string; data: CommentReportCreate }) => {
      await commentsApi.reportComment(commentId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}
