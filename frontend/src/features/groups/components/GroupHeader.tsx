import { Globe, Lock, EyeOff, Users, Settings, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJoinGroup, useLeaveGroup } from "../hooks";
import type { Group } from "@/types";

const PRIVACY_ICONS = { public: Globe, private: Lock, hidden: EyeOff };

interface GroupHeaderProps {
  group: Group;
}

export function GroupHeader({ group }: GroupHeaderProps) {
  const joinMutation = useJoinGroup();
  const leaveMutation = useLeaveGroup();
  const PrivacyIcon = PRIVACY_ICONS[group.privacy] || Globe;

  const handleJoin = () => {
    joinMutation.mutate({ slug: group.slug });
  };

  const handleLeave = () => {
    leaveMutation.mutate(group.slug);
  };

  return (
    <div className="rounded-2xl glass-card overflow-hidden">
      {group.cover_url && (
        <div className="h-32 sm:h-48 w-full bg-muted">
          <img
            src={group.cover_url}
            alt=""
            width={800}
            height={192}
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {group.cover_url ? null : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
              {group.name[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{group.name}</h1>
              <PrivacyIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            {group.description && (
              <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
            )}
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {group.members_count} members
              </span>
              <span className="capitalize">{group.privacy}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {group.is_member ? (
              <>
                {group.member_role === "admin" && (
                  <a href={`/groups/${group.slug}/settings`}>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1.5" />
                      Settings
                    </Button>
                  </a>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLeave}
                  disabled={leaveMutation.isPending}
                  className="text-destructive hover:bg-destructive/10"
                >
                  {leaveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserMinus className="h-4 w-4 mr-1.5" />
                  )}
                  Leave
                </Button>
              </>
            ) : group.has_pending_request ? (
              <Button variant="outline" size="sm" disabled>
                Request Pending
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleJoin}
                disabled={joinMutation.isPending}
              >
                {joinMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-1.5" />
                )}
                {group.privacy === "public" ? "Join" : "Request to Join"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
