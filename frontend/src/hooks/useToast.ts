import { useState, useCallback, useEffect } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastId = 0;
let listeners: Array<(toasts: Toast[]) => void> = [];
let toastsState: Toast[] = [];

function notifyListeners() {
  listeners.forEach((listener) => listener([...toastsState]));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(toastsState);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  const toast = useCallback((options: Omit<Toast, "id">) => {
    const id = String(++toastId);
    const newToast = { ...options, id };
    toastsState = [...toastsState, newToast];
    notifyListeners();

    setTimeout(() => {
      toastsState = toastsState.filter((t) => t.id !== id);
      notifyListeners();
    }, 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    toastsState = toastsState.filter((t) => t.id !== id);
    notifyListeners();
  }, []);

  return { toast, toasts, dismiss };
}
