import { Link } from "react-router-dom";
import { Users, TrendingUp, UserPlus, Hash } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useFriendSuggestions, useFriends, useSendFriendRequest } from "@/features/friends/hooks";
import { useTrendingHashtags } from "@/features/hashtags/hooks";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/useToast";

export function RightSidebar() {
  const { user } = useAuthStore();
  const userId = user?.id || "";
  const { toast } = useToast();

  const { data: suggestions = [], isLoading: suggestionsLoading } = useFriendSuggestions(userId);
  const { data: friends = [], isLoading: friendsLoading } = useFriends(userId);
  const { data: trendingHashtags = [], isLoading: trendingLoading } = useTrendingHashtags(5);
  const sendRequest = useSendFriendRequest(userId);

  return (
    <div className="sticky top-0 h-screen overflow-y-auto p-4 space-y-4 scrollbar-thin">
      <div className="rounded-2xl glass-card p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
            <UserPlus className="h-3.5 w-3.5 text-primary" />
          </div>
          Suggested for you
        </h3>
        {suggestionsLoading ? (
          <div className="space-y-3">
            <SuggestionSkeleton />
            <SuggestionSkeleton />
            <SuggestionSkeleton />
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No suggestions available</p>
        ) : (
          <div className="space-y-1">
            {suggestions.slice(0, 3).map((suggestion) => (
              <div key={suggestion.id} className="flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-muted/40 hover:backdrop-blur-sm">
                <Avatar
                  src={suggestion.avatar_url}
                  alt={suggestion.full_name || undefined}
                  fallback={(suggestion.full_name || "U")[0].toUpperCase()}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold">{suggestion.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">@{suggestion.username}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() => {
                    sendRequest.mutate(suggestion.id, {
                      onSuccess: () => toast({ title: "Friend request sent" }),
                      onError: () => toast({ title: "Failed to send request", variant: "destructive" }),
                    });
                  }}
                  disabled={sendRequest.isPending}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}
        <Link to="/friends?suggestions">
          <Button variant="ghost" className="mt-3 w-full text-sm text-primary rounded-2xl font-semibold">
            See all suggestions
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl glass-card p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20">
            <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
          </div>
          Trending Hashtags
        </h3>
        {trendingLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-muted/60 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-20 rounded-lg bg-muted/60 animate-pulse" />
                  <div className="mt-1 h-3 w-16 rounded-lg bg-muted/60 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : trendingHashtags.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No trending hashtags yet</p>
        ) : (
          <div className="space-y-0.5">
            {trendingHashtags.map((tag) => (
              <Link
                key={tag.id}
                to={`/hashtags/${tag.name}`}
                className="flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-muted/40 hover:backdrop-blur-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-purple-500/15">
                  <Hash className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">#{tag.name}</p>
                  <p className="text-xs text-muted-foreground">{tag.posts_count} posts</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <Link to="/hashtags">
          <Button variant="ghost" className="mt-3 w-full text-sm text-primary rounded-2xl font-semibold">
            Explore all hashtags
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl glass-card p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
            <Users className="h-3.5 w-3.5 text-blue-500" />
          </div>
          Friends
        </h3>
        {friendsLoading ? (
          <div className="space-y-3">
            <FriendSkeleton />
            <FriendSkeleton />
          </div>
        ) : friends.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No friends yet</p>
        ) : (
          <div className="space-y-1">
            {friends.slice(0, 4).map((friend) => (
              <Link
                key={friend.id}
                to={`/profile/${friend.username}`}
                className="flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-muted/40 hover:backdrop-blur-sm"
              >
                <Avatar
                  src={friend.avatar_url}
                  alt={friend.full_name || undefined}
                  fallback={(friend.full_name || "U")[0].toUpperCase()}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold">{friend.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">@{friend.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <Link to="/friends">
          <Button variant="ghost" className="mt-3 w-full text-sm text-primary rounded-2xl font-semibold">
            View all friends
          </Button>
        </Link>
      </div>

      <div className="pt-2 pb-4 text-center text-xs text-muted-foreground/40">
        <p className="font-semibold">Friendix &copy; {new Date().getFullYear()}</p>
        <p className="mt-1">
          <Link to="/settings/privacy" className="hover:text-muted-foreground transition-colors">Privacy</Link>
          {" · "}
          <Link to="/terms" className="hover:text-muted-foreground transition-colors">Terms</Link>
          {" · "}
          <Link to="/help" className="hover:text-muted-foreground transition-colors">Help</Link>
        </p>
      </div>
    </div>
  );
}

function SuggestionSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-muted/60 animate-pulse" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-24 rounded-lg bg-muted/60 animate-pulse" />
        <div className="mt-1 h-3 w-16 rounded-lg bg-muted/60 animate-pulse" />
      </div>
      <Button size="sm" variant="outline" className="rounded-full text-xs">
        Add
      </Button>
    </div>
  );
}

function FriendSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-muted/60 animate-pulse" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-28 rounded-lg bg-muted/60 animate-pulse" />
        <div className="mt-1 h-3 w-20 rounded-lg bg-muted/60 animate-pulse" />
      </div>
    </div>
  );
}
