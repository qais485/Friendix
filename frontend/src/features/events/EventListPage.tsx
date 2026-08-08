import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Calendar, Loader2, Plus, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEventList, useMyEvents, useMyInvites } from "./hooks";
import { EventCard } from "./components/EventCard";
import { useHandleInvite } from "./hooks";
import { formatDistanceToNow } from "@/lib/utils";
import type { EventInvite } from "@/types";

export function EventListPage() {
  const [query, setQuery] = useState("");
  const { data: events, isPending } = useEventList(query || undefined);
  const { data: myEvents } = useMyEvents();
  const { data: myInvites } = useMyInvites();
  const handleInviteMutation = useHandleInvite();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pt-12 md:pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 shadow-card">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Events</h1>
                <p className="text-sm text-muted-foreground">Discover what's happening</p>
              </div>
            </div>
            <Link to="/events/create">
              <Button className="gap-1.5 rounded-xl shadow-card hover:shadow-elevated transition-all duration-200">
                <Plus className="h-4 w-4" />
                Create
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full rounded-full glass-card py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 hover:shadow-elevated"
            />
          </div>

          {/* Invites */}
          {myInvites && myInvites.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold px-1">Pending Invites</h3>
              <div className="space-y-2">
                {myInvites.map((invite: EventInvite) => (
                  <motion.div
                    key={invite.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-2xl glass-card p-4 shadow-card transition-all duration-200 hover:shadow-elevated"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        @{invite.inviter_username} invited you to an event
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(invite.created_at))}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="rounded-xl shadow-card hover:shadow-elevated transition-all duration-200"
                        onClick={() => handleInviteMutation.mutate({ inviteId: invite.id, status: "accepted" })}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl transition-all duration-200 hover:shadow-card"
                        onClick={() => handleInviteMutation.mutate({ inviteId: invite.id, status: "declined" })}
                      >
                        Decline
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* My Events */}
          {myEvents && myEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold px-1">Your Events</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {myEvents.slice(0, 4).map((event, i) => (
                  <EventCard key={event.id} event={event} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* All Events */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold px-1">
              {query ? "Search Results" : "Upcoming Events"}
            </h3>
            {isPending ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !events || events.length === 0 ? (
              <div className="rounded-3xl glass-card p-10 text-center">
                <Inbox className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 text-muted-foreground font-medium">
                  {query ? `No events found for "${query}"` : "No upcoming events"}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  {query ? "Try a different search term" : "Create the first event and invite your friends"}
                </p>
                <Link to="/events/create">
                  <Button className="mt-5 gap-1.5 rounded-xl shadow-card hover:shadow-elevated transition-all duration-200">
                    <Plus className="h-4 w-4" />
                    Create Event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {events.map((event, i) => (
                  <EventCard key={event.id} event={event} index={i} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
