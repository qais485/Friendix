import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-purple-500 text-primary-foreground shadow-sm",
        secondary: "bg-muted/60 backdrop-blur-sm text-secondary-foreground border border-border/40",
        destructive: "bg-gradient-to-r from-red-500 to-rose-500 text-destructive-foreground shadow-sm",
        outline: "border border-border/60 text-foreground bg-card/40 backdrop-blur-sm",
        success: "bg-gradient-to-r from-emerald-500 to-green-500 text-success-foreground shadow-sm",
        warning: "bg-gradient-to-r from-amber-500 to-orange-500 text-warning-foreground shadow-sm",
        info: "bg-gradient-to-r from-blue-500 to-cyan-500 text-info-foreground shadow-sm",
        ghost: "bg-muted/40 backdrop-blur-sm text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
