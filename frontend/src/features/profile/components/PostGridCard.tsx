import { motion } from "framer-motion";
import { Heart, MessageCircle, Play, FileText, Pin, Image } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { getVideoPosterUrl } from "@/lib/cloudinaryTransform";
import { getPostBackgroundStyle } from "@/features/feed/components/composer";
import type { Post } from "@/types";

interface PostGridCardProps {
  post: Post;
  onClick?: (post: Post) => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

export function PostGridCard({ post, onClick }: PostGridCardProps) {
  const imageUrls = post.image_urls || [];
  const bgStyle = getPostBackgroundStyle(post.background_style || "none", null, post.background_image_url);
  const hasBackground = bgStyle.textClass !== "";

  let preview: React.ReactNode;

  if (hasBackground && post.content) {
    preview = (
      <div
        className="flex h-full w-full items-center justify-center p-2 sm:p-3"
        style={bgStyle.style}
      >
        <p className="line-clamp-4 text-center text-xs font-bold leading-snug text-white drop-shadow-sm sm:text-sm">
          {stripHtml(post.content)}
        </p>
      </div>
    );
  } else if (imageUrls.length > 0) {
    preview = (
      <OptimizedImage
        src={imageUrls[0].trim()}
        alt="Post image"
        preset="thumbnail"
        className="h-full w-full object-cover"
      />
    );
  } else if (post.video_url) {
    const poster = getVideoPosterUrl(post.video_url);
    preview = (
      <div className="relative h-full w-full bg-black">
        {poster ? (
          <OptimizedImage
            src={poster}
            alt="Video thumbnail"
            preset="thumbnail"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Image className="h-8 w-8 text-white/40" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform group-hover:scale-110 sm:h-12 sm:w-12">
            <Play className="h-5 w-5 fill-current sm:h-6 sm:w-6" />
          </div>
        </div>
      </div>
    );
  } else if (post.gif_url) {
    preview = (
      <OptimizedImage
        src={post.gif_url}
        alt="GIF"
        preset="full"
        className="h-full w-full object-cover"
      />
    );
  } else {
    const text = post.poll?.question || (post.content ? stripHtml(post.content) : "");
    preview = (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 p-2 text-center sm:gap-2">
        {post.poll ? (
          <FileText className="h-5 w-5 shrink-0 text-primary/60 sm:h-6 sm:w-6" />
        ) : null}
        {text && (
          <p className="line-clamp-4 text-[11px] font-medium leading-snug sm:text-sm">{text}</p>
        )}
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick?.(post)}
      aria-label="Open post"
      className="group relative block aspect-square w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {preview}

      {post.is_pinned && (
        <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          <Pin className="h-3 w-3" />
          Pinned
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-[11px] font-medium text-white">
        <span className="inline-flex items-center gap-1">
          <Heart className="h-3 w-3 fill-current" />
          {post.likes_count}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          {post.comments_count}
        </span>
      </div>
    </motion.button>
  );
}
