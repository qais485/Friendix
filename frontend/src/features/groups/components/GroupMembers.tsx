import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, User, Loader2, MoreHorizontal, Crown, Users, UserPlus, UserCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroupMembers, useUpdateMemberRole, useRemoveMember } from "../hooks";
import { useAuthStore } from "@/store/authStore";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";
import { useRelationshipSummary, useSendFriendRequest } from "@/features/friends/hooks";
import { useToast } from "@/hooks/useToast";
import type { GroupMember, Group } from "@/types";

interface GroupMembersProps {
  group: Group;
}

const ROLE_ICONS = {
  admin: Crown,
  moderator: ShieldCheck,
  member: User,
};

export function GroupMembers({ group }: GroupMembersProps) {
  const { data: members, isPending } = useGroupMembers(group.slug);
  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  if (isPending) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="rounded-3xl glass-card p-8 text-center">
        <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">No members yet</p>
      </div>
    );
  }

  const admins = members.filter((m) => m.role === "admin");
  const moderators = members.filter((m) => m.role === "moderator");
  const regularMembers = members.filter((m) => m.role === "member");

  const renderMember = (m: GroupMember) => {
    const RoleIcon = ROLE_ICONS[m.role] || User;
    const canManage = group.member_role === "admin" || (group.member_role === "moderator" && m.role === "member");

    return (
      <GroupMemberItem
        key={m.id}
        member={m}
        RoleIcon={RoleIcon}
        canManage={canManage}
        groupId={group.creator_id}
        groupSlug={group.slug}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        updateRoleMutation={updateRoleMutation}
        removeMemberMutation={removeMemberMutation}
      />
    );
  };

  return (
    <div className="space-y-4">
      {admins.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase text-muted-foreground px-1 mb-2">Admins</h4>
          <div className="space-y-1">{admins.map(renderMember)}</div>
        </div>
      )}
      {moderators.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase text-muted-foreground px-1 mb-2">Moderators</h4>
          <div className="space-y-1">{moderators.map(renderMember)}</div>
        </div>
      )}
      {regularMembers.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase text-muted-foreground px-1 mb-2">Members</h4>
          <div className="space-y-1">{regularMembers.map(renderMember)}</div>
        </div>
      )}
    </div>
  );
}

function GroupMemberItem({
  member,
  RoleIcon,
  canManage,
  groupId,
  groupSlug,
  openMenu,
  setOpenMenu,
  updateRoleMutation,
  removeMemberMutation,
}: {
  member: GroupMember;
  RoleIcon: typeof User;
  canManage: boolean;
  groupId: string;
  groupSlug: string;
  openMenu: string | null;
  setOpenMenu: (id: string | null) => void;
  updateRoleMutation: any;
  removeMemberMutation: any;
}) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isSelf = user?.id === member.user_id;

  const { data: relationship } = useRelationshipSummary(
    user?.id,
    user?.id && !isSelf ? member.user_id : undefined
  );
  const sendFriendRequest = useSendFriendRequest(user?.id || "");

  return (
    <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/50 relative">
      <Link to={`/profile/${member.username}`}>
        {member.avatar_url ? (
          <img
            src={getCloudinaryTransformedUrl(member.avatar_url, "avatar")}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            decoding="async"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
            {(member.username || "U")[0].toUpperCase()}
          </div>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/profile/${member.username}`} className="text-sm font-medium truncate hover:underline">
          {member.full_name || member.username || "User"}
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <RoleIcon className="h-3 w-3" />
          <span className="capitalize">{member.role}</span>
        </div>
      </div>

      {!isSelf && relationship && (
        <div className="flex shrink-0 items-center gap-1">
          {!relationship.are_friends && !relationship.are_blocked && !relationship.is_following && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => sendFriendRequest.mutate(member.user_id, { onSuccess: () => toast({ title: "Friend request sent" }) })}
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
          <Link to={`/messages?user=${member.user_id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {canManage && member.user_id !== groupId && (
        <div className="relative shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {openMenu === member.id && (
            <div className="absolute right-0 top-full z-10 mt-1 w-40 max-w-[calc(100vw-2rem)] rounded-2xl glass-card p-1.5">
              {member.role !== "admin" && (
                <button
                  onClick={() => {
                    updateRoleMutation.mutate({ slug: groupSlug, userId: member.user_id, role: "admin" });
                    setOpenMenu(null);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-t-2xl"
                >
                  <Crown className="h-4 w-4" />
                  Make Admin
                </button>
              )}
              {member.role !== "moderator" && (
                <button
                  onClick={() => {
                    updateRoleMutation.mutate({ slug: groupSlug, userId: member.user_id, role: "moderator" });
                    setOpenMenu(null);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Make Moderator
                </button>
              )}
              {member.role !== "member" && (
                <button
                  onClick={() => {
                    updateRoleMutation.mutate({ slug: groupSlug, userId: member.user_id, role: "member" });
                    setOpenMenu(null);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                >
                  <User className="h-4 w-4" />
                  Make Member
                </button>
              )}
              <button
                onClick={() => {
                  removeMemberMutation.mutate({ slug: groupSlug, userId: member.user_id });
                  setOpenMenu(null);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-b-2xl"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
