import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Loader2, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroupEvents, useCreateEvent, useAttendEvent } from "../hooks";
import type { Group } from "@/types";

interface GroupEventsProps {
  group: Group;
}

export function GroupEvents({ group }: GroupEventsProps) {
  const { data: events, isPending } = useGroupEvents(group.slug);
  const createMutation = useCreateEvent();
  const attendMutation = useAttendEvent();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");

  const canCreate = group.is_member;

  const handleCreate = () => {
    if (!title.trim() || !startTime) return;
    createMutation.mutate(
      {
        slug: group.slug,
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        start_time: new Date(startTime).toISOString(),
      },
      {
        onSuccess: () => {
          setTitle(""); setDescription(""); setLocation(""); setStartTime("");
          setShowForm(false);
        },
      }
    );
  };

  if (isPending) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {canCreate && (
        <>
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Create Event"}
          </Button>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-2xl glass-card p-4 space-y-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <Button size="sm" onClick={handleCreate} disabled={!title.trim() || !startTime || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Calendar className="h-4 w-4 mr-1" />}
                Create
              </Button>
            </motion.div>
          )}
        </>
      )}

      {!events || events.length === 0 ? (
        <div className="rounded-3xl glass-card p-8 text-center">
          <Calendar className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No events yet</p>
        </div>
      ) : (
        events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-2xl glass-card p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{event.title}</h4>
                {event.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(event.start_time).toLocaleDateString()}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.location}
                    </span>
                  )}
                  <span>{event.attendees_count} attending</span>
                </div>
              </div>
              {group.is_member && (
                <Button
                  variant={event.is_attending ? "outline" : "default"}
                  size="sm"
                  onClick={() => attendMutation.mutate({ slug: group.slug, eventId: event.id, status: event.is_attending ? "maybe" : "going" })}
                  disabled={attendMutation.isPending}
                  className="shrink-0"
                >
                  {event.is_attending ? <Check className="h-4 w-4 mr-1" /> : null}
                  {event.is_attending ? "Going" : "RSVP"}
                </Button>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
