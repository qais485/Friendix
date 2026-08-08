import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import type { SearchResultComment } from "@/types/search";

interface CommentSearchResultsProps {
  comments: SearchResultComment[];
}

export function CommentSearchResults({ comments }: CommentSearchResultsProps) {
  if (comments.length === 0) return null;

  return (
    <div className="space-y-2">
      {comments.map((comment) => (
        <motion.div
          key={comment.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            to={`/post/${comment.post_id}`}
            className="block rounded-2xl glass-card p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate font-medium text-foreground">
                @{comment.username}
              </span>
              <span className="shrink-0">commented</span>
              <span className="ml-auto shrink-0 whitespace-nowrap text-xs">
                {formatDistanceToNow(new Date(comment.created_at))}
              </span>
            </div>
            {comment.content && (
              <p className="mt-2 line-clamp-3 break-words whitespace-pre-wrap text-sm">
                {comment.content}
              </p>
            )}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
