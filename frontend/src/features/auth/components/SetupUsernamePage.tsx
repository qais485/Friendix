import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AtSign, ArrowRight, Check, Loader2, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useUpdateUsername } from "@/features/profile/hooks";
import { isValidUsername, smartUsername, USERNAME_MAX_LENGTH } from "@/lib/username";
import { profileApi } from "@/services/profileApi";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export function SetupUsernamePage() {
  const { user, fetchUser } = useAuthStore();
  const navigate = useNavigate();

  const suggested = useMemo(
    () => smartUsername(user?.full_name || ""),
    [user?.full_name]
  );
  const [username, setUsername] = useState(suggested);
  const [status, setStatus] = useState<UsernameStatus>("idle");
  const [isSaving, setIsSaving] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const updateUsername = useUpdateUsername();

  useEffect(() => {
    abortRef.current?.abort();

    if (!username || username.length < 3) {
      setStatus("idle");
      return;
    }
    if (!isValidUsername(username)) {
      setStatus("invalid");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const timeoutId = setTimeout(async () => {
      setStatus("checking");
      try {
        const { data } = await profileApi.checkUsername(
          { username },
          controller.signal
        );
        if (!controller.signal.aborted) {
          setStatus(data.available ? "available" : "taken");
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setStatus("invalid");
        }
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [username]);

  const canContinue = status === "available";

  const handleSave = async () => {
    if (!canContinue || isSaving) return;
    setIsSaving(true);
    try {
      await updateUsername.mutateAsync(username);
      await fetchUser();
      navigate("/home", { replace: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 text-white text-xl font-bold mb-4 shadow-glow"
          >
            F
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-3xl font-black tracking-tight"
          >
            Pick your username
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-3 text-muted-foreground"
          >
            This is how friends will find you on Friendix.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="rounded-3xl glass-card p-8 shadow-float"
        >
          {user?.avatar_url && (
            <div className="flex justify-center mb-6">
              <img
                src={getCloudinaryTransformedUrl(user.avatar_url, "avatar")}
                alt={user.full_name || "User"}
                width={64}
                height={64}
                loading="lazy"
                decoding="async"
                className="h-16 w-16 rounded-full object-cover ring-4 ring-primary/10"
              />
            </div>
          )}

          <div className="relative mb-4">
            <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""));
                setStatus("idle");
              }}
                className="h-12 pl-10 text-base rounded-full"
              placeholder="username"
              maxLength={USERNAME_MAX_LENGTH}
              autoFocus
            />
          </div>

          <div className="min-h-[24px] mb-6">
            {status === "idle" && (
              <p className="text-sm text-muted-foreground">
                <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                Letters, numbers, underscores, and periods (3-30 characters).
              </p>
            )}
            {status === "checking" && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Checking availability...
              </p>
            )}
            {status === "invalid" && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <X className="h-3.5 w-3.5" />
                Only letters, numbers, underscores, and periods allowed.
              </p>
            )}
            {status === "taken" && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <X className="h-3.5 w-3.5" />
                That username is already taken.
              </p>
            )}
            {status === "available" && (
              <p className="flex items-center gap-1.5 text-sm text-success">
                <Check className="h-3.5 w-3.5" />
                Great - this one is yours!
              </p>
            )}
          </div>

          <Button
            size="lg"
            className="w-full rounded-full"
            onClick={handleSave}
            disabled={!canContinue || isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            You can change this later from your profile settings.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
