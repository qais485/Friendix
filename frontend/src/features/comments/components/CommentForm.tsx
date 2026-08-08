import { useState } from "react";
import { useCreateComment } from "../hooks";
import { useToast } from "@/hooks/useToast";
import { tracking } from "@/services/tracking";
import { Send } from "lucide-react";

interface CommentFormProps {
  postId: string;
  parentId?: string;
  placeholder?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function CommentForm({ postId, parentId, placeholder = "Write a comment...", onCancel, autoFocus = false }: CommentFormProps) {
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const createComment = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || createComment.isPending) return;
    try {
      await createComment.mutateAsync({ postId, data: { content: content.trim(), parent_id: parentId } });
      tracking.comment({ content_type: "post", content_id: postId, context: parentId ? "reply" : "comment" });
      setContent("");
      onCancel?.();
    } catch {
      toast({ title: "Error", description: "Failed to post comment", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="min-w-0 flex-1 rounded-xl bg-muted px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
        disabled={createComment.isPending}
      />
      <button
        type="submit"
        disabled={!content.trim() || createComment.isPending}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" />
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel} className="shrink-0 px-3 text-sm text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      )}
    </form>
  );
}
