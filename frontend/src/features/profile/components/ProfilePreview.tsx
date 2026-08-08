import { motion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { Profile } from "@/types";

interface ProfilePreviewProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfilePreview({ profile, isOpen, onClose }: ProfilePreviewProps) {
  if (!isOpen) return null;

  const initials = profile.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile.email[0].toUpperCase();

  const themeColors: Record<string, string> = {
    default: "from-primary/20 to-muted",
    ocean: "from-blue-200 to-cyan-200 dark:from-blue-900 dark:to-cyan-800",
    sunset: "from-orange-200 to-rose-200 dark:from-orange-900 dark:to-rose-800",
    forest: "from-green-200 to-emerald-200 dark:from-green-900 dark:to-emerald-800",
    midnight: "from-indigo-200 to-purple-200 dark:from-indigo-900 dark:to-purple-800",
    lavender: "from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn("relative h-32 bg-gradient-to-br", themeColors[profile.profile_theme] || themeColors.default)}>
          {profile.cover_photo_url && (
            <OptimizedImage
              src={profile.cover_photo_url}
              alt="Cover"
              preset="feed"
              className="h-full w-full object-cover"
            />
          )}
          <Button variant="ghost" size="icon" className="absolute right-2 top-2 text-white/80 hover:text-white" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="-mt-12 flex justify-center">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-background bg-gradient-to-br from-primary/20 to-muted">
              {profile.avatar_url ? (
                <OptimizedImage
                  src={profile.avatar_url}
                  alt={profile.full_name || "Avatar"}
                  preset="avatar"
                  eager
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-2xl font-bold text-primary/40">{initials}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="flex min-w-0 items-center justify-center gap-2">
              <h2 className="min-w-0 break-words text-xl font-bold">{profile.full_name || "User"}</h2>
              {profile.is_verified && (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {profile.username && <p className="truncate text-muted-foreground">@{profile.username}</p>}
          </div>

          {profile.bio && <p className="mt-4 break-words text-center text-sm text-muted-foreground">{profile.bio}</p>}

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            {profile.location && <span>{profile.location}</span>}
            {profile.work && <span>{profile.work}</span>}
            {profile.education && <span>{profile.education}</span>}
          </div>

          {profile.website && (
            <div className="mt-4 flex justify-center">
              <a
                href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-0 items-center gap-1 break-all text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                {profile.website}
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
