import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-3xl glass-card border border-dashed py-12 sm:py-20 text-center px-6", className)}>
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40 backdrop-blur-sm">
          <Icon className="h-8 w-8 text-muted-foreground/50" />
        </div>
      )}
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
