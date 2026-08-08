import { X } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-16 right-4 z-50 flex flex-col gap-2 md:bottom-6 md:right-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={cn(
            "flex w-full max-w-80 items-start gap-3 rounded-2xl glass-card p-4 animate-in slide-in-from-right",
            toast.variant === "destructive" && "border-destructive/50 bg-destructive/10"
          )}
        >
          <div className="flex-1">
            {toast.title && (
              <p className="text-sm font-bold">{toast.title}</p>
            )}
            {toast.description && (
              <p className="mt-1 text-sm text-muted-foreground">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="shrink-0 rounded-full p-1 hover:bg-muted"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
