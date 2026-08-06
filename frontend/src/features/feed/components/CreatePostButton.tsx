import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenSquare, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CreatePostForm } from "./CreatePostForm";
import type { PostCreate } from "@/types";

interface CreatePostButtonProps {
  onSubmit: (data: PostCreate) => void;
  isSubmitting?: boolean;
  userAvatar?: string | null;
  userName?: string | null;
}

export function CreatePostButton({
  onSubmit,
  isSubmitting,
  userAvatar,
  userName,
}: CreatePostButtonProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Lock body scroll + close on ESC while the modal is open.
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSubmit = (data: PostCreate) => {
    onSubmit(data);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50 active:scale-[0.99]"
        aria-label="Create post"
      >
        <Avatar
          src={userAvatar}
          alt={userName || "User"}
          fallback={(userName || "U")[0].toUpperCase()}
          size="sm"
        />
        <span className="flex-1 truncate text-sm text-muted-foreground">
          What&apos;s on your mind, {userName?.split(" ")[0] || "there"}?
        </span>
        <PenSquare className="h-5 w-5 shrink-0 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={close}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="relative z-10 flex max-h-[90vh] w-full max-w-[620px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold">Create post</h2>
                <button
                  onClick={close}
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                  aria-label="Close create post"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <CreatePostForm
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  userAvatar={userAvatar}
                  userName={userName}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}