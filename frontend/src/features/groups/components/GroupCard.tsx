import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, Lock, EyeOff, Users } from "lucide-react";
import type { Group } from "@/types";

interface GroupCardProps {
  group: Group;
  index?: number;
}

const PRIVACY_ICONS = { public: Globe, private: Lock, hidden: EyeOff };

export function GroupCard({ group, index = 0 }: GroupCardProps) {
  const PrivacyIcon = PRIVACY_ICONS[group.privacy] || Globe;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link
        to={`/groups/${group.slug}`}
        className="block rounded-2xl glass-card p-4 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-start gap-4">
          {group.cover_url ? (
            <img
              src={group.cover_url}
              alt=""
              className="h-14 w-14 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
              {group.name[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-base font-bold truncate">{group.name}</p>
              <PrivacyIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </div>
            {group.description && (
              <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                {group.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {group.members_count} {group.members_count === 1 ? "member" : "members"}
              </span>
              <span className="capitalize">{group.privacy}</span>
            </div>
          </div>
          {group.is_member && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Joined
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
