import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Hash, Loader2, Users, FileText, Inbox } from "lucide-react";
import { useHashtagDetail, useHashtagPosts } from "./hooks";
import { FollowButton } from "./components/FollowButton";
import { HashtagPostCard } from "./components/HashtagPostCard";
import { Button } from "@/components/ui/button";

export function HashtagDetailPage() {
  const { name } = useParams<{ name: string }>();
  const hashtagName = name || "";

  const { data: hashtag, isPending: detailPending, error: detailError } = useHashtagDetail(hashtagName);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data: postsData, isPending: postsPending } = useHashtagPosts(
    hashtagName,
    limit,
    offset
  );

  const handleLoadMore = useCallback(() => {
    setOffset((prev) => prev + limit);
  }, []);

  if (detailPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (detailError || !hashtag) {
    return (
      <div className="min-h-screen bg-background bg-gradient-to-br from-background via-background to-primary/5">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="rounded-2xl glass-card p-8 text-center transition-all duration-200">
            <Hash className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">
              Hashtag not found
            </p>
            <Link to="/hashtags">
              <Button variant="outline" className="mt-4 rounded-xl transition-all duration-200 hover:shadow-elevated">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Hashtags
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const posts = postsData?.posts || [];
  const totalCount = postsData?.total_count || 0;
  const hasMore = posts.length < totalCount;

  return (
    <div className="min-h-screen bg-background bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Header */}
          <div className="pt-12 md:pt-0">
            <Link
              to="/hashtags"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Hashtags
            </Link>

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 shadow-card transition-all duration-200">
                <Hash className="h-7 w-7 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  #{hashtag.name}
                </h1>
                {hashtag.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {hashtag.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 transition-all duration-200 hover:text-foreground">
                    <FileText className="h-4 w-4" />
                    {hashtag.posts_count} {hashtag.posts_count === 1 ? "post" : "posts"}
                  </span>
                  <span className="flex items-center gap-1 transition-all duration-200 hover:text-foreground">
                    <Users className="h-4 w-4" />
                    {hashtag.followers_count} {hashtag.followers_count === 1 ? "follower" : "followers"}
                  </span>
                </div>
              </div>
              <FollowButton
                hashtagName={hashtag.name}
                isFollowing={hashtag.is_following}
                size="md"
              />
            </div>
          </div>

          {/* Posts */}
          {postsPending && posts.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
          <div className="rounded-2xl glass-card p-8 text-center transition-all duration-200">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">
                No posts with #{hashtag.name} yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Be the first to post with this hashtag!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post, i) => (
                <HashtagPostCard key={post.id} post={post} index={i} />
              ))}
              {hasMore && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl transition-all duration-200 hover:shadow-elevated"
                  onClick={handleLoadMore}
                  disabled={postsPending}
                >
                  {postsPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Load more"
                  )}
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
