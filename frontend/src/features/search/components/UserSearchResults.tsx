import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useRelationshipSummary, useSendFriendRequest, useFollow } from "@/features/friends/hooks";
import { useToast } from "@/hooks/useToast";
import type { SearchResultUser } from "@/types/search";

interface UserSearchResultsProps {
  users: SearchResultUser[];
}

export function UserSearchResults({ users }: UserSearchResultsProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();

  if (users.length === 0) return null;

  return (
    <div className="space-y-2">
      {users.map((searchUser) => (
        <UserSearchResultCard key={searchUser.id} user={searchUser} currentUserId={user?.id} toast={toast} />
      ))}
    </div>
  );
}

function UserSearchResultCard({ user: searchUser, currentUserId, toast }: { user: SearchResultUser; currentUserId?: string; toast: any }) {
  const { data: relationship } = useRelationshipSummary(currentUserId, currentUserId ? searchUser.id : undefined);
  const sendFriendRequest = useSendFriendRequest(currentUserId || "");
  const followUser = useFollow(currentUserId || "");

  const isSelf = currentUserId === searchUser.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 rounded-2xl glass-card p-4 transition-colors hover:bg-muted/50">
        <Link to={`/profile/${searchUser.username}`} className="flex items-center gap-3 flex-1 min-w-0">
          {searchUser.avatar_url ? (
            <img
              src={searchUser.avatar_url}
              alt=""
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {(searchUser.username || "U")[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold truncate">
                {searchUser.full_name || "Unknown"}
              </p>
              {searchUser.is_verified && (
                <BadgeCheck className="h-4 w-4 shrink-0 text-blue-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              @{searchUser.username}
            </p>
            {searchUser.bio && (
              <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                {searchUser.bio}
              </p>
            )}
          </div>
        </Link>

        {!isSelf && relationship && (
          <div className="flex items-center gap-2 shrink-0">
            {!relationship.are_friends && !relationship.are_blocked && !relationship.is_following && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-full"
                  onClick={() => sendFriendRequest.mutate(searchUser.id, { onSuccess: () => toast({ title: "Friend request sent" }) })}
                  disabled={sendFriendRequest.isPending}
                >
                  {sendFriendRequest.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Friend"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => followUser.mutate(searchUser.id, { onSuccess: () => toast({ title: "Following" }) })}
                  disabled={followUser.isPending}
                >
                  {followUser.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Follow"}
                </Button>
              </>
            )}
            {relationship.is_following && !relationship.are_friends && !relationship.are_blocked && (
              <Button variant="outline" size="sm" className="rounded-full" disabled>
                Following
              </Button>
            )}
            {relationship.are_friends && (
              <Button variant="secondary" size="sm" className="rounded-full" disabled>
                Friends
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
