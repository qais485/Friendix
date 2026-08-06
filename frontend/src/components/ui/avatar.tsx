import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full ring-2 ring-white/30 shadow-lg",
  {
    variants: {
      size: {
        xs: "h-6 w-6",
        sm: "h-8 w-8",
        default: "h-10 w-10",
        md: "h-12 w-12",
        lg: "h-16 w-16",
        xl: "h-20 w-20",
        "2xl": "h-24 w-24",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const AVATAR_SIZE_PX: Record<string, number> = {
  xs: 24,
  sm: 32,
  default: 40,
  md: 48,
  lg: 64,
  xl: 80,
  "2xl": 96,
};

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  showRing?: boolean;
  ringColor?: string;
  eager?: boolean;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, showRing = false, ringColor = "ring-background", eager = false, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);

    const initials = fallback || "?";
    const shouldShowImage = src && !hasError;
    const px = AVATAR_SIZE_PX[size || "default"] || 40;

    return (
      <div
        ref={ref}
        className={cn(
          avatarVariants({ size }),
          showRing && "ring-2 ring-offset-2",
          showRing && ringColor,
          className
        )}
        {...props}
      >
        {shouldShowImage ? (
          <OptimizedImage
            src={src!}
            alt={alt || "Avatar"}
            preset="avatar"
            width={px}
            height={px}
            eager={eager}
            className="aspect-square h-full w-full object-cover"
            onImageError={() => setHasError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary font-bold">
            <span className="text-current select-none">
              {initials}
            </span>
          </div>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

const AvatarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { max?: number }>(
  ({ className, children, max = 4, ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const visibleChildren = childArray.slice(0, max);
    const remaining = childArray.length - max;

    return (
      <div ref={ref} className={cn("flex -space-x-3", className)} {...props}>
        {visibleChildren.map((child, i) => (
          <div key={i} className="relative ring-2 ring-background rounded-full shadow-lg">
            {child}
          </div>
        ))}
        {remaining > 0 && (
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-semibold ring-2 ring-background shadow-lg">
            +{remaining}
          </div>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarGroup, avatarVariants };
