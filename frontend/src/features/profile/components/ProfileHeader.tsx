import { Camera, Pencil } from "lucide-react";
import type { Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderProps {
  profile: Profile;
  isOwn: boolean;
  onEditCover?: () => void;
  onEditAvatar?: () => void;
}

export function ProfileHeader({ profile, isOwn, onEditCover, onEditAvatar }: ProfileHeaderProps) {
  const initials = profile.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile.email[0].toUpperCase();

  return (
    <div className="relative">
      <div className="relative h-48 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/15 to-pink-500/10 sm:h-64 shadow-float">
        {profile.cover_photo_url && (
          <img
            src={profile.cover_photo_url}
            alt="Cover"
            width={1200}
            height={400}
            decoding="async"
            className="h-full w-full object-cover"
          />
        )}
        {!profile.cover_photo_url && (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-7xl font-black text-primary/10">{initials}</div>
          </div>
        )}

        {isOwn && onEditCover && (
          <Button
            variant="glass"
            size="sm"
            className="absolute bottom-4 right-4 gap-2 rounded-full text-white shadow-float"
            onClick={onEditCover}
          >
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Edit Cover</span>
          </Button>
        )}
      </div>

      <div className="relative -mt-16 px-4 sm:-mt-20 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
          <div className="relative">
            <Avatar
              src={profile.avatar_url}
              alt={profile.full_name || "Avatar"}
              fallback={initials}
              size="2xl"
              showRing
              ringColor="ring-background"
              className="border-4 border-background shadow-float"
            />

            {isOwn && onEditAvatar && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-0 right-0 h-10 w-10 rounded-full shadow-lg"
                onClick={onEditAvatar}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex-1 pb-2 text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-black tracking-tight">
                {profile.full_name || "User"}
              </h1>
              {profile.is_verified && (
                <Badge variant="info" className="rounded-full text-xs">
                  Verified
                </Badge>
              )}
            </div>
            {profile.username && (
              <p className="text-muted-foreground">@{profile.username}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
