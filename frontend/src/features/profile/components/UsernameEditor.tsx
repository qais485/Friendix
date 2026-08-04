import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2, AtSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isValidUsername, USERNAME_MAX_LENGTH } from "@/lib/username";
import { profileApi } from "@/services/profileApi";

interface UsernameEditorProps {
  currentUsername: string | null;
  onSave: (username: string) => Promise<void>;
}

export function UsernameEditor({
  currentUsername,
  onSave,
}: UsernameEditorProps) {
  const [username, setUsername] = useState(currentUsername || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();

    if (!username || username === currentUsername || username.length < 3) {
      setError(null);
      setIsChecking(false);
      return;
    }

    if (!isValidUsername(username)) {
      setError("Only letters, numbers, underscores, and periods allowed");
      setIsChecking(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsChecking(true);

    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await profileApi.checkUsername(
          { username },
          controller.signal
        );
        if (!controller.signal.aborted) {
          setError(data.available ? null : "Username is already taken");
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setError("Failed to check username");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsChecking(false);
        }
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [username, currentUsername]);

  const handleSave = async () => {
    if (!username || error) return;

    setIsSaving(true);
    try {
      await onSave(username);
      setIsEditing(false);
    } catch {
      setError("Failed to save username");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setUsername(currentUsername || "");
    setError(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Username</label>

      {!isEditing ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl glass-card px-3 py-2">
            <AtSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">
              {currentUsername || "Not set"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase());
                  setError(null);
                }}
                className="pl-9"
                placeholder="username"
                maxLength={USERNAME_MAX_LENGTH}
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              onClick={handleSave}
              disabled={isSaving || !!error || isChecking || !username || username === currentUsername}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}
            {isChecking && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Checking...
              </motion.p>
            )}
            {!error && !isChecking && username && username !== currentUsername && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-green-600"
              >
                Username is available!
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
