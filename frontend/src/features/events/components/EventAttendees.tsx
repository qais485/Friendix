import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Loader2, UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useEventAttendees } from "../hooks";
import { useRelationshipSummary, useSendFriendRequest } from "@/features/friends/hooks";
import { useToast } from "@/hooks/useToast";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";

interface EventAttendeesProps {
  eventId: string;
}

export function EventAttendees({ eventId }: EventAttendeesProps) {
  const { data: attendees, isPending } = useEventAttendees(eventId);

  if (isPending) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!attendees || attendees.length === 0) {
    return (
      <div className="rounded-3xl glass-card p-8 text-center">
        <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">No attendees yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {attendees.map((a, i) => (
        <EventAttendeeItem key={a.id} attendee={a} index={i} />
      ))}
    </div>
  );
}

function EventAttendeeItem({ attendee, index }: { attendee: any; index: number }) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isSelf = user?.id === attendee.user_id;

  const { data: relationship } = useRelationshipSummary(
    user?.id,
    user?.id && !isSelf ? attendee.user_id : undefined
  );
  const sendFriendRequest = useSendFriendRequest(user?.id || "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/50"
    >
      <Link to={`/profile/${attendee.username}`}>
        {attendee.avatar_url ? (
          <img
            src={getCloudinaryTransformedUrl(attendee.avatar_url, "avatar")}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            decoding="async"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
            {(attendee.username || "U")[0].toUpperCase()}
          </div>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/profile/${attendee.username}`} className="block truncate text-sm font-medium hover:underline">
          {attendee.username}
        </Link>
        <p className="text-xs text-muted-foreground capitalize">{attendee.status}</p>
      </div>

      {!isSelf && relationship && (
        <div className="flex shrink-0 items-center gap-1">
          {!relationship.are_friends && !relationship.are_blocked && !relationship.is_following && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => sendFriendRequest.mutate(attendee.user_id, { onSuccess: () => toast({ title: "Friend request sent" }) })}
              disabled={sendFriendRequest.isPending}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          )}
          {relationship.is_following && !relationship.are_friends && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
              <UserCheck className="h-4 w-4 text-green-500" />
            </Button>
          )}
          {relationship.are_friends && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
              <UserCheck className="h-4 w-4 text-blue-500" />
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
