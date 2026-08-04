import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Megaphone, Calendar, BarChart3, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGroupDetail } from "./hooks";
import { GroupHeader } from "./components/GroupHeader";
import { GroupMembers } from "./components/GroupMembers";
import { GroupAnnouncements } from "./components/GroupAnnouncements";
import { GroupEvents } from "./components/GroupEvents";
import { GroupPolls } from "./components/GroupPolls";
import { GroupChat } from "./components/GroupChat";
import { GroupJoinRequests } from "./components/GroupJoinRequests";

type Tab = "chat" | "members" | "announcements" | "events" | "polls" | "requests";

export function GroupDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const groupSlug = slug || "";
  const { data: group, isPending, error } = useGroupDetail(groupSlug);
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  const tabs: { key: Tab; label: string; icon: typeof Users; show: boolean }[] = [
    { key: "chat", label: "Chat", icon: MessageCircle, show: true },
    { key: "members", label: "Members", icon: Users, show: true },
    { key: "announcements", label: "Announcements", icon: Megaphone, show: true },
    { key: "events", label: "Events", icon: Calendar, show: true },
    { key: "polls", label: "Polls", icon: BarChart3, show: true },
    { key: "requests", label: "Requests", icon: Users, show: !!(group?.is_member && (group?.member_role === "admin" || group?.member_role === "moderator")) },
  ];

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="rounded-3xl glass-card p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
              <Users className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="mt-5 text-base font-medium text-foreground">Group not found</p>
            <p className="mt-1.5 text-sm text-muted-foreground">This group may have been removed or doesn't exist.</p>
            <Link to="/groups">
              <Button variant="outline" className="mt-5 rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Groups
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              to="/groups"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Groups
            </Link>
          </div>

          <GroupHeader group={group} />

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.filter((t) => t.show).map((tab) => (
              <Button
                key={tab.key}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-medium transition-all duration-200 shrink-0",
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
          {activeTab === "chat" && <GroupChat group={group} />}
          {activeTab === "members" && <GroupMembers group={group} />}
          {activeTab === "announcements" && <GroupAnnouncements group={group} />}
          {activeTab === "events" && <GroupEvents group={group} />}
          {activeTab === "polls" && <GroupPolls group={group} />}
          {activeTab === "requests" && <GroupJoinRequests group={group} />}
        </motion.div>
      </div>
    </div>
  );
}
