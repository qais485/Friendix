import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Shield, Eye, Users, MessageCircle, AtSign, Search, Clock, UserX, Volume2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  usePrivacySettings,
  useUpdatePrivacySettings,
  useBlockedUsers,
  useMutedUsers,
  useRestrictedUsers,
  useBlockUser,
  useMuteUser,
  useRestrictUser,
  useUnblockUser,
  useUnmuteUser,
  useUnrestrictUser,
} from "./hooks";
import {
  PrivacySection,
  PrivacyToggle,
  BlockMuteList,
  UserSearch,
} from "./components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PrivacySettingUpdate } from "@/types";

const PROFILE_VISIBILITY_OPTIONS = [
  { value: "public", label: "Public", description: "Anyone can see your profile" },
  { value: "friends", label: "Friends Only", description: "Only friends can see your profile" },
  { value: "private", label: "Private", description: "Only you can see your profile" },
] as const;

const PRIVACY_DROPDOWN_OPTIONS = [
  { value: "everyone", label: "Everyone" },
  { value: "friends", label: "Friends" },
  { value: "close_friends", label: "Close Friends" },
  { value: "followers", label: "Followers" },
  { value: "friends_followers", label: "Friends & Followers" },
  { value: "only_me", label: "Only Me" },
] as const;

const PERMISSION_OPTIONS = [
  { value: "everyone", label: "Everyone" },
  { value: "friends", label: "Friends" },
  { value: "close_friends", label: "Close Friends" },
  { value: "none", label: "No One" },
] as const;

const FOLLOW_OPTIONS = [
  { value: "everyone", label: "Everyone" },
  { value: "friends", label: "Friends" },
  { value: "none", label: "No One" },
] as const;

export function PrivacySettingsPage() {
  const { user } = useAuthStore();
  const userId = user?.id || "";

  const { data: settings, isLoading } = usePrivacySettings(userId || undefined);
  const updateSettings = useUpdatePrivacySettings(userId);

  const { data: blockedUsers = [], isLoading: blockedLoading } = useBlockedUsers(userId || undefined);
  const { data: mutedUsers = [], isLoading: mutedLoading } = useMutedUsers(userId || undefined);
  const { data: restrictedUsers = [], isLoading: restrictedLoading } = useRestrictedUsers(userId || undefined);

  const unblockUser = useUnblockUser(userId);
  const unmuteUser = useUnmuteUser(userId);
  const unrestrictUser = useUnrestrictUser(userId);
  const blockUser = useBlockUser(userId);
  const muteUser = useMuteUser(userId);
  const restrictUser = useRestrictUser(userId);

  const [activeTab, setActiveTab] = useState<"settings" | "blocked" | "muted" | "restricted">("settings");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleUpdate = async (data: PrivacySettingUpdate) => {
    await updateSettings.mutateAsync(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="pt-12 md:pt-0">
            <h1 className="text-2xl font-bold tracking-tight">Privacy Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Control who can see your content and interact with you.
            </p>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { key: "settings", label: "General", icon: <Shield className="h-4 w-4" /> },
              { key: "blocked", label: `Blocked (${blockedUsers.length})`, icon: <UserX className="h-4 w-4" /> },
              { key: "muted", label: `Muted (${mutedUsers.length})`, icon: <Volume2 className="h-4 w-4" /> },
              { key: "restricted", label: `Restricted (${restrictedUsers.length})`, icon: <Clock className="h-4 w-4" /> },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={cn(
                  "gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-all duration-200",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-card"
                    : "text-muted-foreground hover:bg-muted hover:shadow-sm"
                )}
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>

          {activeTab === "settings" && settings && (
            <div className="space-y-5">
              <PrivacySection title="Profile Visibility" description="Control who can see your profile information." icon={<Eye className="h-5 w-5" />}>
                <div className="grid gap-2">
                  {PROFILE_VISIBILITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleUpdate({ profile_visibility: option.value })}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
                        settings.profile_visibility === option.value
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                      {settings.profile_visibility === option.value && (
                        <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </PrivacySection>

              <PrivacySection title="Activity Visibility" description="Control who can see your online status and activity." icon={<Clock className="h-5 w-5" />}>
                <div className="space-y-4">
                  <PrivacyToggle label="Hide Online Status" description="Others won't see when you're active" checked={settings.hide_online_status} onCheckedChange={(checked) => handleUpdate({ hide_online_status: checked })} />
                  <PrivacyToggle label="Hide Last Seen" description="Others won't see when you were last active" checked={settings.hide_last_seen} onCheckedChange={(checked) => handleUpdate({ hide_last_seen: checked })} />
                  <PrivacyToggle label="Hide Birthday" description="Others won't see your birthday" checked={settings.hide_birthday} onCheckedChange={(checked) => handleUpdate({ hide_birthday: checked })} />
                </div>
              </PrivacySection>

              <PrivacySection title="Personal Information" description="Control who can see your personal details." icon={<Users className="h-5 w-5" />}>
                <div className="space-y-4">
                  <PrivacyToggle label="Hide Phone Number" description="Others won't see your phone number" checked={settings.hide_phone} onCheckedChange={(checked) => handleUpdate({ hide_phone: checked })} />
                  <PrivacyToggle label="Hide Email" description="Others won't see your email address" checked={settings.hide_email} onCheckedChange={(checked) => handleUpdate({ hide_email: checked })} />
                  <PrivacyToggle label="Hide Work" description="Others won't see your work information" checked={settings.hide_work} onCheckedChange={(checked) => handleUpdate({ hide_work: checked })} />
                  <PrivacyToggle label="Hide Education" description="Others won't see your education information" checked={settings.hide_education} onCheckedChange={(checked) => handleUpdate({ hide_education: checked })} />
                </div>
              </PrivacySection>

              <PrivacySection title="Content Privacy" description="Control who can see your stories, posts, reels, photos, and videos." icon={<Users className="h-5 w-5" />}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Story Privacy</label>
                    <select value={settings.story_privacy} onChange={(e) => handleUpdate({ story_privacy: e.target.value as PrivacySettingUpdate["story_privacy"] })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {PRIVACY_DROPDOWN_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Post Privacy</label>
                    <select value={settings.post_privacy} onChange={(e) => handleUpdate({ post_privacy: e.target.value as PrivacySettingUpdate["post_privacy"] })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {PRIVACY_DROPDOWN_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reel Privacy</label>
                    <select value={settings.reel_privacy} onChange={(e) => handleUpdate({ reel_privacy: e.target.value as PrivacySettingUpdate["reel_privacy"] })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {PRIVACY_DROPDOWN_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Photo Privacy</label>
                    <select value={settings.photo_privacy} onChange={(e) => handleUpdate({ photo_privacy: e.target.value as PrivacySettingUpdate["photo_privacy"] })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {PRIVACY_DROPDOWN_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Video Privacy</label>
                    <select value={settings.video_privacy} onChange={(e) => handleUpdate({ video_privacy: e.target.value as PrivacySettingUpdate["video_privacy"] })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {PRIVACY_DROPDOWN_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Comment Privacy</label>
                    <select value={settings.comment_privacy} onChange={(e) => handleUpdate({ comment_privacy: e.target.value as PrivacySettingUpdate["comment_privacy"] })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {PRIVACY_DROPDOWN_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                </div>
              </PrivacySection>

              <PrivacySection title="Lists Visibility" description="Control who can see your friends, followers, and following lists." icon={<Users className="h-5 w-5" />}>
                <div className="space-y-4">
                  <PrivacyToggle label="Hide Friends List" description="Others won't see your friends list" checked={settings.hide_friends_list} onCheckedChange={(checked) => handleUpdate({ hide_friends_list: checked })} />
                  <PrivacyToggle label="Hide Followers List" description="Others won't see your followers list" checked={settings.hide_followers_list} onCheckedChange={(checked) => handleUpdate({ hide_followers_list: checked })} />
                  <PrivacyToggle label="Hide Following List" description="Others won't see who you're following" checked={settings.hide_following_list} onCheckedChange={(checked) => handleUpdate({ hide_following_list: checked })} />
                </div>
              </PrivacySection>

              <PrivacySection title="Tags & Timeline" description="Control tagging and timeline review settings." icon={<MessageCircle className="h-5 w-5" />}>
                <div className="space-y-4">
                  <PrivacyToggle label="Tag Review" description="Review tags before they appear on your profile" checked={settings.tag_review} onCheckedChange={(checked) => handleUpdate({ tag_review: checked })} />
                  <PrivacyToggle label="Timeline Review" description="Review posts before they appear on your timeline" checked={settings.timeline_review} onCheckedChange={(checked) => handleUpdate({ timeline_review: checked })} />
                </div>
              </PrivacySection>

              <PrivacySection title="Search & Visibility" description="Control how others can find and interact with you." icon={<Search className="h-5 w-5" />}>
                <div className="space-y-4">
                  <PrivacyToggle label="Search Engine Visibility" description="Allow search engines to index your profile" checked={settings.search_engine_visibility} onCheckedChange={(checked) => handleUpdate({ search_engine_visibility: checked })} />
                </div>
              </PrivacySection>

              <PrivacySection title="Interactions" description="Control who can mention, follow, send friend requests, and contact you." icon={<AtSign className="h-5 w-5" />}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mention Permissions</label>
                    <select value={settings.mention_permissions} onChange={(e) => handleUpdate({ mention_permissions: e.target.value as PrivacySettingUpdate["mention_permissions"] })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {PERMISSION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Follow Permissions</label>
                    <select value={settings.follow_permissions} onChange={(e) => handleUpdate({ follow_permissions: e.target.value as PrivacySettingUpdate["follow_permissions"] })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {FOLLOW_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Friend Request Permissions</label>
                    <select value={settings.friend_request_permissions} onChange={(e) => handleUpdate({ friend_request_permissions: e.target.value as PrivacySettingUpdate["friend_request_permissions"] })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {PERMISSION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message Permissions</label>
                    <select value={settings.message_permissions} onChange={(e) => handleUpdate({ message_permissions: e.target.value as PrivacySettingUpdate["message_permissions"] })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {PERMISSION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Call Permissions</label>
                    <select value={settings.call_permissions} onChange={(e) => handleUpdate({ call_permissions: e.target.value as PrivacySettingUpdate["call_permissions"] })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {PERMISSION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Media Download Permissions</label>
                    <select value={settings.download_media_permissions} onChange={(e) => handleUpdate({ download_media_permissions: e.target.value as PrivacySettingUpdate["download_media_permissions"] })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {PERMISSION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Invite Permissions</label>
                    <select value={settings.invite_permissions} onChange={(e) => handleUpdate({ invite_permissions: e.target.value as PrivacySettingUpdate["invite_permissions"] })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {PERMISSION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                </div>
              </PrivacySection>
            </div>
          )}

          {activeTab === "blocked" && (
            <PrivacySection title="Blocked Users" description="Users you've blocked can't see your profile, posts, or contact you." icon={<UserX className="h-5 w-5" />}>
              <UserSearch
                onSelect={(blockedUserId: string) => {
                  blockUser.mutate(blockedUserId);
                }}
                excludeIds={blockedUsers.map((u) => u.id)}
                placeholder="Search users to block..."
              />
              <BlockMuteList users={blockedUsers} type="block" isLoading={blockedLoading} onRemove={(blockedUserId: string) => unblockUser.mutate(blockedUserId)} isRemoving={unblockUser.isPending} />
            </PrivacySection>
          )}

          {activeTab === "muted" && (
            <PrivacySection title="Muted Users" description="You won't see posts or stories from muted users." icon={<Volume2 className="h-5 w-5" />}>
              <UserSearch
                onSelect={(mutedUserId: string) => {
                  muteUser.mutate(mutedUserId);
                }}
                excludeIds={mutedUsers.map((u) => u.id)}
                placeholder="Search users to mute..."
              />
              <BlockMuteList users={mutedUsers} type="mute" isLoading={mutedLoading} onRemove={(mutedUserId: string) => unmuteUser.mutate(mutedUserId)} isRemoving={unmuteUser.isPending} />
            </PrivacySection>
          )}

          {activeTab === "restricted" && (
            <PrivacySection title="Restricted Users" description="Their comments on your posts are only visible to them." icon={<Clock className="h-5 w-5" />}>
              <UserSearch
                onSelect={(restrictedUserId: string) => {
                  restrictUser.mutate(restrictedUserId);
                }}
                excludeIds={restrictedUsers.map((u) => u.id)}
                placeholder="Search users to restrict..."
              />
              <BlockMuteList users={restrictedUsers} type="restrict" isLoading={restrictedLoading} onRemove={(restrictedUserId: string) => unrestrictUser.mutate(restrictedUserId)} isRemoving={unrestrictUser.isPending} />
            </PrivacySection>
          )}
        </motion.div>
      </div>
    </div>
  );
}
