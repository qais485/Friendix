import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PrivacySectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function PrivacySection({ title, description, icon, children }: PrivacySectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl glass-card p-4 sm:p-6"
    >
      <div className="flex items-start gap-4">
        {icon && <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold">{title}</h3>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          <div className="mt-4 space-y-4">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}
