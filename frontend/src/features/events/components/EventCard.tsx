import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRSVPEvent } from "../hooks";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const rsvpMutation = useRSVPEvent();
  const startDate = new Date(event.start_time);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="rounded-2xl glass-card overflow-hidden">
        {event.cover_url && (
          <Link to={`/events/${event.id}`}>
            <img
              src={getCloudinaryTransformedUrl(event.cover_url, "modal")}
              alt=""
              width={400}
              height={144}
              loading="lazy"
              decoding="async"
              className="h-36 w-full object-cover"
            />
          </Link>
        )}
        <div className="p-4">
          <Link to={`/events/${event.id}`} className="block">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{startDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
              <span>·</span>
              <span>{startDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <h3 className="font-bold text-base line-clamp-1">{event.title}</h3>
            {event.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {event.event_type === "online" ? (
                <span className="flex items-center gap-1">
                  <Video className="h-3.5 w-3.5" />
                  Online
                </span>
              ) : event.location ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location}
                </span>
              ) : null}
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {event.attendees_count} {event.attendees_count === 1 ? "attendee" : "attendees"}
              </span>
            </div>
          </Link>
          <div className="mt-3 flex items-center gap-2">
            {event.is_cancelled ? (
              <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                Cancelled
              </span>
            ) : event.rsvp_status === "going" ? (
              <Button variant="outline" size="sm" onClick={() => rsvpMutation.mutate({ id: event.id, status: "maybe" })} disabled={rsvpMutation.isPending}>
                Going ✓
              </Button>
            ) : event.rsvp_status === "maybe" ? (
              <Button variant="outline" size="sm" onClick={() => rsvpMutation.mutate({ id: event.id, status: "going" })} disabled={rsvpMutation.isPending}>
                Maybe
              </Button>
            ) : (
              <Button size="sm" onClick={() => rsvpMutation.mutate({ id: event.id, status: "going" })} disabled={rsvpMutation.isPending}>
                {rsvpMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
              </Button>
            )}
            <Link to={`/events/${event.id}`}>
              <Button variant="ghost" size="sm">Details</Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
