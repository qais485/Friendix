import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useBlockUser, useMuteUser } from "@/features/privacy/hooks";
import { useSendFriendRequest, useFollow, useAddCloseFriend } from "@/features/friends/hooks";
import { useToast } from "@/hooks/useToast";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { PostSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

function errorMessage(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string } }; message?: string };
  return e.response?.data?.detail ?? e.message ?? "Something went wrong";
}
import {
  useHomeFeed,
  useFollowingFeed,
  useFriendsFeed,
  useTrendingFeed,
  useSuggestedPosts,
  useCreatePost,
  useDeletePost,
  useSavePost,
  useUnsavePost,
  useHidePost,
  useUnhidePost,
  usePinPost,
  useUnpinPost,
  useArchivePost,
  useUnarchivePost,
  useVotePoll,
  useRepostPost,
  useLikePost,
  useUnlikePost,
  useUpdatePost,
  useQuotePost,
} from "./hooks";
import {
  PostCard,
  PostModal,
  CreatePostButton,
  FeedTabs,
  FeedFilters,
  EmptyFeed,
  StoriesRow,
} from "./components";
import { useFeedReels } from "@/features/media/hooks";
import { ReelPlayer } from "@/features/media/components";
import { InputDialog } from "@/components/ui/InputDialog";
import type { FeedType, FeedSortBy, PostCreate, Post } from "@/types";

export function HomePage() {
  const { user } = useAuthStore();
  const userId = user?.id || "";

  const [activeTab, setActiveTab] = useState<FeedType>("home");
  const [sortBy, setSortBy] = useState<FeedSortBy>("latest");
  const observerRef = useRef<HTMLDivElement>(null);

  const homeFeed = useHomeFeed(userId || undefined);
  const followingFeed = useFollowingFeed(userId || undefined);
  const friendsFeed = useFriendsFeed(userId || undefined);
  const trendingFeed = useTrendingFeed(userId || undefined);
  const suggestedPosts = useSuggestedPosts(userId || undefined);
  const feedReels = useFeedReels(userId || undefined);
  const reels = feedReels.data ?? [];

  const createPost = useCreatePost();
  const deletePost = useDeletePost();
  const savePost = useSavePost(userId);
  const unsavePost = useUnsavePost(userId);
  const hidePost = useHidePost();
  const unhidePost = useUnhidePost(userId);
  const pinPost = usePinPost();
  const unpinPost = useUnpinPost();
  const archivePost = useArchivePost(userId);
  const unarchivePost = useUnarchivePost(userId);
  const votePoll = useVotePoll();
  const repostPost = useRepostPost();
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const updatePost = useUpdatePost();
  const quotePost = useQuotePost();
  const blockUser = useBlockUser(userId);
  const muteUser = useMuteUser(userId);
  const sendFriendRequest = useSendFriendRequest(userId);
  const followUser = useFollow(userId);
  const addCloseFriend = useAddCloseFriend(userId);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [quoteDialogPostId, setQuoteDialogPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const getActiveFeed = () => {
    switch (activeTab) {
      case "home": return homeFeed;
      case "following": return followingFeed;
      case "friends": return friendsFeed;
      case "trending": return trendingFeed;
      default: return homeFeed;
    }
  };

  const activeFeed = getActiveFeed();
  const posts = activeFeed.data?.pages.flatMap((page) => page.posts) ?? [];
  const isLoading = activeTab === "suggested" ? suggestedPosts.isLoading : activeFeed.isLoading;
  const isFetchingNext = activeTab === "suggested" ? false : activeFeed.isFetchingNextPage;
  const hasNextPage = activeTab === "suggested" ? false : activeFeed.hasNextPage;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNext) {
      activeFeed.fetchNextPage();
    }
  }, [hasNextPage, isFetchingNext, activeFeed]);

  useInfiniteScroll(observerRef, handleLoadMore);

  useScrollRestoration(`feed:${activeTab}`, !!userId);

  const isFeedError = activeTab === "suggested"
    ? suggestedPosts.isError
    : activeFeed.isError;

  const handleRetry = useCallback(() => {
    if (activeTab === "suggested") {
      suggestedPosts.refetch();
    } else {
      activeFeed.refetch();
    }
  }, [activeTab, activeFeed, suggestedPosts]);

  const handleCreatePost = useCallback(async (data: PostCreate) => { await createPost.mutateAsync(data); }, [createPost]);
  const handleDeletePost = useCallback((postId: string) => {
    deletePost.mutate(postId, {
      onSuccess: () => toast({ title: "Post deleted" }),
      onError: () => toast({ title: "Failed to delete post", variant: "destructive" }),
    });
  }, [deletePost, toast]);
  const handleSavePost = useCallback(async (postId: string) => { await savePost.mutateAsync(postId); }, [savePost]);
  const handleUnsavePost = useCallback(async (postId: string) => { await unsavePost.mutateAsync(postId); }, [unsavePost]);
  const handleHidePost = useCallback(async (postId: string) => { await hidePost.mutateAsync(postId); }, [hidePost]);
  const handleUnhidePost = useCallback(async (postId: string) => { await unhidePost.mutateAsync(postId); }, [unhidePost]);
  const handlePinPost = useCallback(async (postId: string) => { await pinPost.mutateAsync(postId); }, [pinPost]);
  const handleUnpinPost = useCallback(async (postId: string) => { await unpinPost.mutateAsync(postId); }, [unpinPost]);
  const handleArchivePost = useCallback(async (postId: string) => { await archivePost.mutateAsync(postId); }, [archivePost]);
  const handleUnarchivePost = useCallback(async (postId: string) => { await unarchivePost.mutateAsync(postId); }, [unarchivePost]);
  const handleVotePoll = useCallback(async (pollId: string, optionId: string) => { await votePoll.mutateAsync({ pollId, optionId }); }, [votePoll]);
  const handleRepostPost = useCallback(async (postId: string) => {
    try {
      await repostPost.mutateAsync({ postId });
    } catch (err) {
      toast({ title: "Failed to repost", description: errorMessage(err), variant: "destructive" });
    }
  }, [repostPost, toast]);
  const handleLikePost = useCallback(async (postId: string) => {
    try {
      await likePost.mutateAsync(postId);
    } catch (err) {
      toast({ title: "Failed to like", description: errorMessage(err), variant: "destructive" });
    }
  }, [likePost, toast]);
  const handleUnlikePost = useCallback(async (postId: string) => { await unlikePost.mutateAsync(postId); }, [unlikePost]);
  const handleEditPost = useCallback(async (post: { id: string; content?: string | null }) => {
    await updatePost.mutateAsync({ postId: post.id, data: { content: post.content || "" } });
  }, [updatePost]);
  const handleQuotePost = useCallback(async (postId: string) => {
    setQuoteDialogPostId(postId);
  }, []);
  const handleQuoteConfirm = useCallback(async (quoteText: string) => {
    if (quoteDialogPostId) {
      await quotePost.mutateAsync({ postId: quoteDialogPostId, quoteText });
      setQuoteDialogPostId(null);
    }
  }, [quoteDialogPostId, quotePost]);
  const handleBlockUser = useCallback((userId: string) => {
    blockUser.mutate(userId, {
      onSuccess: () => {
        toast({ title: "User blocked" });
        queryClient.invalidateQueries({ queryKey: ["feed"] });
      },
      onError: () => toast({ title: "Failed to block user", variant: "destructive" }),
    });
  }, [blockUser, toast, queryClient]);
  const handleMuteUser = useCallback((userId: string) => {
    muteUser.mutate(userId, {
      onSuccess: () => {
        toast({ title: "User muted" });
        queryClient.invalidateQueries({ queryKey: ["feed"] });
      },
      onError: () => toast({ title: "Failed to mute user", variant: "destructive" }),
    });
  }, [muteUser, toast, queryClient]);
  const handleReportPost = useCallback((_postId: string) => {
    toast({ title: "Report submitted", description: "Thank you for your report." });
  }, [toast]);
  const handleFollowUser = useCallback((userId: string) => {
    followUser.mutate(userId, {
      onSuccess: () => {
        toast({ title: "Following" });
        queryClient.invalidateQueries({ queryKey: ["feed"] });
      },
      onError: () => toast({ title: "Failed to follow user", variant: "destructive" }),
    });
  }, [followUser, toast, queryClient]);
  const handleAddFriend = useCallback((userId: string) => {
    sendFriendRequest.mutate(userId, {
      onSuccess: () => {
        toast({ title: "Friend request sent" });
        queryClient.invalidateQueries({ queryKey: ["feed"] });
      },
      onError: () => toast({ title: "Failed to send friend request", variant: "destructive" }),
    });
  }, [sendFriendRequest, toast, queryClient]);
  const handleAddCloseFriend = useCallback((userId: string) => {
    addCloseFriend.mutate(userId, {
      onSuccess: () => {
        toast({ title: "Added to close friends" });
        queryClient.invalidateQueries({ queryKey: ["feed"] });
      },
      onError: () => toast({ title: "Failed to add close friend", variant: "destructive" }),
    });
  }, [addCloseFriend, toast, queryClient]);

  const handleOpenPost = useCallback((post: Post) => setSelectedPost(post), []);

  const sortedPosts = activeTab === "suggested" ? [] : [...posts].sort((a, b) => {
    if (sortBy === "trending") return b.trending_score - a.trending_score;
    if (sortBy === "popular") return b.likes_count - a.likes_count;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const navigate = useNavigate();
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    if (!userId) {
      const timer = setTimeout(() => setShowTimeout(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [userId]);

  if (!userId) {
    if (showTimeout) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-xl font-semibold">Authentication required</h1>
            <p className="mt-2 text-muted-foreground">Please log in to continue.</p>
            <Button className="mt-4 rounded-full" onClick={() => navigate("/login")}>Go to Login</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-2xl px-4 py-6 md:px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          <div className="pt-12 md:pt-0">
            <h1 className="text-2xl font-black tracking-tight text-gradient">Home</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your social hub - share posts, photos, videos, and stories.
            </p>
          </div>

          <StoriesRow />

          <CreatePostButton
            onSubmit={handleCreatePost as (data: PostCreate) => void}
            isSubmitting={createPost.isPending}
            userAvatar={user?.avatar_url}
            userName={user?.full_name}
          />

          {reels.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Reels</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reels.slice(0, 6).map((reel) => (
                  <ReelPlayer key={reel.id} reel={reel} />
                ))}
              </div>
            </div>
          )}

          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <FeedFilters sortBy={sortBy} onSortChange={setSortBy} />

          {isFeedError ? (
            <ErrorState onRetry={handleRetry} />
          ) : isLoading ? (
            <div className="space-y-4">
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </div>
          ) : sortedPosts.length === 0 ? (
            <EmptyFeed feedType={activeTab} />
          ) : (
            <div className="space-y-4">
              {sortedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={userId}
                  onOpenPost={handleOpenPost}
                  onDelete={handleDeletePost}
                  onSave={handleSavePost}
                  onUnsave={handleUnsavePost}
                  onHide={handleHidePost}
                  onUnhide={handleUnhidePost}
                  onPin={handlePinPost}
                  onUnpin={handleUnpinPost}
                  onArchive={handleArchivePost}
                  onUnarchive={handleUnarchivePost}
                  onRepost={handleRepostPost}
                  onVotePoll={handleVotePoll}
                  onLike={handleLikePost}
                  onUnlike={handleUnlikePost}
                  onEdit={handleEditPost}
                  onQuote={handleQuotePost}
                  onBlock={handleBlockUser}
                  onMute={handleMuteUser}
                  onReport={handleReportPost}
                  onFollow={handleFollowUser}
                  onAddFriend={handleAddFriend}
                  onAddCloseFriend={handleAddCloseFriend}
                />
              ))}

              {activeTab === "suggested" && suggestedPosts.data && (
                <div className="space-y-4">
                  {suggestedPosts.data.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={userId}
                      onOpenPost={handleOpenPost}
                      onDelete={handleDeletePost}
                      onSave={handleSavePost}
                      onUnsave={handleUnsavePost}
                      onHide={handleHidePost}
                      onUnhide={handleUnhidePost}
                      onRepost={handleRepostPost}
                      onVotePoll={handleVotePoll}
                      onLike={handleLikePost}
                      onUnlike={handleUnlikePost}
                      onEdit={handleEditPost}
                      onQuote={handleQuotePost}
                      onBlock={handleBlockUser}
                      onMute={handleMuteUser}
                      onReport={handleReportPost}
                      onFollow={handleFollowUser}
                      onAddFriend={handleAddFriend}
                      onAddCloseFriend={handleAddCloseFriend}
                    />
                  ))}
                </div>
              )}

              <div ref={observerRef} className="flex justify-center py-4">
                {isFetchingNext && (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <InputDialog
        isOpen={quoteDialogPostId !== null}
        onClose={() => setQuoteDialogPostId(null)}
        onConfirm={handleQuoteConfirm}
        title="Add a quote"
        placeholder="What's on your mind?"
        confirmLabel="Post Quote"
      />

      {selectedPost && (
        <PostModal
          post={selectedPost}
          currentUserId={userId}
          isOpen={selectedPost !== null}
          onClose={() => setSelectedPost(null)}
          onDelete={handleDeletePost}
          onSave={handleSavePost}
          onUnsave={handleUnsavePost}
          onHide={handleHidePost}
          onUnhide={handleUnhidePost}
          onPin={handlePinPost}
          onUnpin={handleUnpinPost}
          onArchive={handleArchivePost}
          onUnarchive={handleUnarchivePost}
          onRepost={handleRepostPost}
          onVotePoll={handleVotePoll}
          onLike={handleLikePost}
          onUnlike={handleUnlikePost}
          onEdit={handleEditPost}
          onQuote={handleQuotePost}
          onBlock={handleBlockUser}
          onMute={handleMuteUser}
          onReport={handleReportPost}
          onFollow={handleFollowUser}
          onAddFriend={handleAddFriend}
          onAddCloseFriend={handleAddCloseFriend}
        />
      )}
    </div>
  );
}
