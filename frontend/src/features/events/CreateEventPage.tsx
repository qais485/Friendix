import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Loader2, Video, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateEvent } from "./hooks";

export function CreateEventPage() {
  const navigate = useNavigate();
  const createMutation = useCreateEvent();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<"online" | "offline">("offline");
  const [location, setLocation] = useState("");
  const [onlineLink, setOnlineLink] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reminder, setReminder] = useState(60);

  const handleSubmit = () => {
    if (!title.trim() || !startTime) return;
    createMutation.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        event_type: eventType,
        location: eventType === "offline" ? (location.trim() || undefined) : undefined,
        online_link: eventType === "online" ? (onlineLink.trim() || undefined) : undefined,
        start_time: new Date(startTime).toISOString(),
        end_time: endTime ? new Date(endTime).toISOString() : undefined,
        reminder_minutes: reminder,
      },
      {
        onSuccess: (event) => {
          navigate(`/events/${event.id}`);
        },
      }
    );
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
            <button
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold tracking-tight">Create Event</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Fill in the details to create your event
            </p>
          </div>

          <div className="space-y-5 rounded-2xl glass-card p-6 shadow-card">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's the event about?"
                className="w-full rounded-xl border bg-background px-4 py-3 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 hover:shadow-elevated"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell people more about the event..."
                rows={4}
                className="w-full rounded-xl border bg-background px-4 py-3 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all duration-200 hover:shadow-elevated"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setEventType("offline")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all duration-200 ${
                    eventType === "offline"
                      ? "border-primary bg-primary/10 text-primary shadow-card"
                      : "hover:bg-muted hover:shadow-card"
                  }`}
                >
                  <MapPin className="h-5 w-5" />
                  In-Person
                </button>
                <button
                  onClick={() => setEventType("online")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all duration-200 ${
                    eventType === "online"
                      ? "border-primary bg-primary/10 text-primary shadow-card"
                      : "hover:bg-muted hover:shadow-card"
                  }`}
                >
                  <Video className="h-5 w-5" />
                  Online
                </button>
              </div>
            </div>

            {eventType === "offline" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where is the event?"
                  className="w-full rounded-xl border bg-background px-4 py-3 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 hover:shadow-elevated"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Online Link</label>
                <input
                  value={onlineLink}
                  onChange={(e) => setOnlineLink(e.target.value)}
                  placeholder="Zoom, Meet, or other link"
                  className="w-full rounded-xl border bg-background px-4 py-3 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 hover:shadow-elevated"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start *</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border bg-background px-4 py-3 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 hover:shadow-elevated"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border bg-background px-4 py-3 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 hover:shadow-elevated"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reminder</label>
              <select
                value={reminder}
                onChange={(e) => setReminder(Number(e.target.value))}
                className="w-full rounded-full border border-border/60 bg-card/60 backdrop-blur-md px-4 py-3 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 hover:shadow-elevated"
              >
                <option value={0}>No reminder</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={1440}>1 day before</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl transition-all duration-200 hover:shadow-card"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl shadow-card hover:shadow-elevated transition-all duration-200"
              onClick={handleSubmit}
              disabled={!title.trim() || !startTime || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Create Event
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
