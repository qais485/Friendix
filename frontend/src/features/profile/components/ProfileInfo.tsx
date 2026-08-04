import { motion } from "framer-motion";
import {
  Globe,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Calendar,
  Languages,
  Sparkles,
} from "lucide-react";
import type { Profile } from "@/types";

interface ProfileInfoProps {
  profile: Profile;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  if (!value) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3"
    >
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </motion.div>
  );
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
  const hasInfo =
    profile.bio || profile.website || profile.location || profile.work ||
    profile.education || profile.birthday || profile.gender ||
    profile.relationship_status || profile.languages || profile.interests;

  if (!hasInfo) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>No profile information yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {profile.bio && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
        </motion.div>
      )}

      {profile.interests && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex flex-wrap gap-2">
            {profile.interests.split(",").map((interest) => (
              <span
                key={interest.trim()}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                <Sparkles className="h-3 w-3" />
                {interest.trim()}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoItem icon={<Briefcase className="h-4 w-4" />} label="Work" value={profile.work} />
        <InfoItem icon={<GraduationCap className="h-4 w-4" />} label="Education" value={profile.education} />
        <InfoItem icon={<MapPin className="h-4 w-4" />} label="Location" value={profile.location} />
        <InfoItem icon={<Heart className="h-4 w-4" />} label="Relationship" value={profile.relationship_status} />
        <InfoItem icon={<Calendar className="h-4 w-4" />} label="Birthday" value={profile.birthday} />
        <InfoItem icon={<Languages className="h-4 w-4" />} label="Languages" value={profile.languages} />
      </div>

      {profile.website && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <a
            href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline"
          >
            {profile.website}
          </a>
        </motion.div>
      )}
    </div>
  );
}
