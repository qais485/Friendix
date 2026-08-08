import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Calendar, MapPin, Video, Users, Clock, Loader2,
  UserPlus, Trash2, Ban, MessageCircle, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";
import { useEventDetail, useRSVPEvent, useDeleteEvent, useCancelEvent } from "./hooks";
import { EventAttendees } from "./components/EventAttendees";
import { EventChat } from "./components/EventChat";
import { InviteModal } from "./components/InviteModal";

type Tab = "chat" | "attendees";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = id || "";
  const navigate = useNavigate();
  const { data: event, isPending, error } = useEventDetail(eventId);
  const rsvpMutation = useRSVPEvent();
  const deleteMutation = useDeleteEvent();
  const cancelMutation = useCancelEvent();
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [showInvite, setShowInvite] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="rounded-3xl glass-card p-10 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 font-medium text-muted-foreground">Event not found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              This event may have been removed or doesn't exist.
            </p>
            <Link to="/events">
              <Button variant="outline" className="mt-5 rounded-xl transition-all duration-200 hover:shadow-card">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.start_time);
  const endDate = event.end_time ? new Date(event.end_time) : null;

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="pt-12 md:pt-0">
            <Link
              to="/events"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Events
            </Link>
          </div>

          {/* Event Header */}
          <div className="rounded-2xl glass-card overflow-hidden shadow-card">
            {event.cover_url && (
              <div className="relative">
                <img
                  src={getCloudinaryTransformedUrl(event.cover_url, "modal")}
                  alt=""
                  width={800}
                  height={208}
                  loading="lazy"
                  decoding="async"
                  className="h-52 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            )}
            <div className="p-4 sm:p-6">
              {event.is_cancelled && (
                <span className="mb-3 inline-block rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                  Cancelled
                </span>
              )}
              <h1 className="break-words text-2xl font-bold tracking-tight">{event.title}</h1>

              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <span className="min-w-0 break-words">
                    {startDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    {" · "}
                    {startDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    {endDate && ` – ${endDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`}
                  </span>
                </div>
                {event.event_type === "online" ? (
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Video className="h-4 w-4 text-primary" />
                    </div>
                    <span>Online Event</span>
                    {event.online_link && (
                      <a
                        href={event.online_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline transition-all duration-200"
                      >
                        Join Link
                      </a>
                    )}
                  </div>
                ) : event.location ? (
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <span className="min-w-0 break-words">{event.location}</span>
                  </div>
                ) : null}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span>{event.attendees_count} attending · {event.invited_count} invited</span>
                </div>
                {event.reminder_minutes > 0 && (
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <span>Reminder {event.reminder_minutes >= 60 ? `${event.reminder_minutes / 60}h` : `${event.reminder_minutes}m`} before</span>
                  </div>
                )}
              </div>

              {event.description && (
                <p className="mt-5 break-words text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              )}

              {/* RSVP Buttons */}
              {!event.is_cancelled && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {event.rsvp_status === "going" ? (
                    <Button
                      variant="outline"
                      className="rounded-xl transition-all duration-200 hover:shadow-card"
                      onClick={() => rsvpMutation.mutate({ id: eventId, status: "maybe" })}
                      disabled={rsvpMutation.isPending}
                    >
                      <span className="mr-1.5">✓</span> Going
                    </Button>
                  ) : event.rsvp_status === "maybe" ? (
                    <Button
                      variant="outline"
                      className="rounded-xl transition-all duration-200 hover:shadow-card"
                      onClick={() => rsvpMutation.mutate({ id: eventId, status: "going" })}
                      disabled={rsvpMutation.isPending}
                    >
                      <Clock className="mr-1.5 h-4 w-4" /> Maybe
                    </Button>
                  ) : (
                    <Button
                      className="rounded-xl shadow-card hover:shadow-elevated transition-all duration-200"
                      onClick={() => rsvpMutation.mutate({ id: eventId, status: "going" })}
                      disabled={rsvpMutation.isPending}
                    >
                      {rsvpMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Calendar className="mr-1.5 h-4 w-4" />}
                      Join Event
                    </Button>
                  )}
                  {event.rsvp_status === "going" && (
                    <Button
                      variant="outline"
                      className="rounded-xl transition-all duration-200 hover:shadow-card"
                      onClick={() => rsvpMutation.mutate({ id: eventId, status: "declined" })}
                      disabled={rsvpMutation.isPending}
                    >
                      Can't go
                    </Button>
                  )}
                  {event.is_creator && (
                    <>
                      <Button
                        variant="outline"
                        className="rounded-xl transition-all duration-200 hover:shadow-card"
                        onClick={() => setShowInvite(true)}
                      >
                        <UserPlus className="mr-1.5 h-4 w-4" />
                        Invite
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl transition-all duration-200 hover:shadow-card"
                        onClick={handleCancel}
                        disabled={cancelMutation.isPending}
                      >
                        <Ban className="mr-1.5 h-4 w-4" />
                        Cancel Event
                      </Button>
                      <Button
                        variant="destructive"
                        className="rounded-xl transition-all duration-200"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { key: "chat" as const, label: "Chat", icon: MessageCircle },
              { key: "attendees" as const, label: "Attendees", icon: Users },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "rounded-xl px-4 text-xs font-medium transition-all duration-200 shrink-0",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-card hover:shadow-elevated"
                    : "text-muted-foreground hover:bg-muted hover:shadow-card"
                )}
              >
                <tab.icon className="mr-1.5 h-3.5 w-3.5" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Content */}
          {activeTab === "chat" && <EventChat event={event} />}
          {activeTab === "attendees" && <EventAttendees eventId={eventId} />}
        </motion.div>
      </div>

      <InviteModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        eventId={eventId}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          deleteMutation.mutate(eventId, { onSuccess: () => navigate("/events") });
          setShowDeleteConfirm(false);
        }}
        title="Delete Event"
        description="This action cannot be undone. The event and all its data will be permanently removed."
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
      />

      <ConfirmationDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          cancelMutation.mutate(eventId);
          setShowCancelConfirm(false);
        }}
        title="Cancel Event"
        description="Are you sure you want to cancel this event? Attendees will be notified."
        confirmLabel="Cancel Event"
        destructive
        loading={cancelMutation.isPending}
      />
    </div>
  );
}
