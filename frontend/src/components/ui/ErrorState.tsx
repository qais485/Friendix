import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-3xl glass-card border border-dashed py-12 sm:py-20 text-center px-6", className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 backdrop-blur-sm">
        <AlertTriangle className="h-8 w-8 text-destructive/70" />
      </div>
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5 rounded-full" onClick={onRetry}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Try Again
        </Button>
      )}
    </div>
  );
}

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorBanner({
  message = "Connection lost. Some features may be unavailable.",
  onRetry,
  onDismiss,
  className,
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 backdrop-blur-md px-4 py-3 text-sm",
        className
      )}
    >
      <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
      <p className="min-w-0 flex-1 break-words text-destructive">{message}</p>
      {onRetry && (
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onRetry}>
          Retry
        </Button>
      )}
      {onDismiss && (
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onDismiss}>
          Dismiss
        </Button>
      )}
    </div>
  );
}
