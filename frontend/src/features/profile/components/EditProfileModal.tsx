import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check, AtSign, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isValidUsername, USERNAME_MAX_LENGTH } from "@/lib/username";
import { profileApi } from "@/services/profileApi";
import type { Profile, ProfileUpdate } from "@/types";

interface EditProfileModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProfileUpdate) => Promise<void>;
}

const RELATIONSHIP_OPTIONS = [
  "Single", "In a relationship", "Engaged", "Married",
  "In an open relationship", "It's complicated", "Divorced", "Widowed",
];

const THEME_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "ocean", label: "Ocean" },
  { value: "sunset", label: "Sunset" },
  { value: "forest", label: "Forest" },
  { value: "midnight", label: "Midnight" },
  { value: "lavender", label: "Lavender" },
];

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export function EditProfileModal({ profile, isOpen, onClose, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState<ProfileUpdate>({
    full_name: profile.full_name || "",
    bio: profile.bio || "",
    website: profile.website || "",
    gender: profile.gender || "",
    birthday: profile.birthday || "",
    relationship_status: profile.relationship_status || "",
    education: profile.education || "",
    work: profile.work || "",
    location: profile.location || "",
    languages: profile.languages || "",
    interests: profile.interests || "",
    profile_theme: profile.profile_theme || "default",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState(profile.username || "");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const usernameCheckRef = useRef<AbortController | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setFormData({
      full_name: profile.full_name || "",
      bio: profile.bio || "",
      website: profile.website || "",
      gender: profile.gender || "",
      birthday: profile.birthday || "",
      relationship_status: profile.relationship_status || "",
      education: profile.education || "",
      work: profile.work || "",
      location: profile.location || "",
      languages: profile.languages || "",
      interests: profile.interests || "",
      profile_theme: profile.profile_theme || "default",
    });
    setUsername(profile.username || "");
    setUsernameError(null);
    setUsernameChecking(false);
    setUsernameAvailable(false);
  }, [profile]);

  useEffect(() => {
    usernameCheckRef.current?.abort();

    if (!username || username === profile.username || username.length < 3) {
      setUsernameError(null);
      setUsernameChecking(false);
      setUsernameAvailable(false);
      return;
    }

    if (!isValidUsername(username)) {
      setUsernameError("Only letters, numbers, underscores, and periods allowed");
      setUsernameChecking(false);
      setUsernameAvailable(false);
      return;
    }

    const controller = new AbortController();
    usernameCheckRef.current = controller;
    setUsernameChecking(true);
    setUsernameAvailable(false);

    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await profileApi.checkUsername(
          { username },
          controller.signal
        );
        if (!controller.signal.aborted) {
          setUsernameError(data.available ? null : "Username is already taken");
          setUsernameAvailable(data.available);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setUsernameError("Failed to check username");
          setUsernameAvailable(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setUsernameChecking(false);
        }
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [username, profile.username]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
    if (e.key === "Tab" && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => {
        const firstInput = modalRef.current?.querySelector<HTMLElement>("input, textarea, select");
        firstInput?.focus();
      }, 100);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const handleSave = async () => {
    if (!username || usernameError || usernameChecking) return;
    setIsSaving(true);
    try { await onSave({ ...formData, username }); onClose(); } finally { setIsSaving(false); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-card p-4 shadow-float sm:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 id="edit-profile-title" className="text-xl font-black">Edit Profile</h2>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose} aria-label="Close dialog">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase());
                    setUsernameError(null);
                  }}
                  className="pl-9"
                  placeholder="username"
                  maxLength={USERNAME_MAX_LENGTH}
                />
              </div>
              {usernameChecking && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Checking availability...
                </p>
              )}
              {!usernameChecking && usernameError && (
                <p className="text-xs text-destructive">{usernameError}</p>
              )}
              {!usernameChecking && !usernameError && username && username !== profile.username && usernameAvailable && (
                <p className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Username is available!
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name || ""}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={formData.gender || ""}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value || null })}
                  className="flex h-10 w-full rounded-full border border-border/60 bg-card/60 backdrop-blur-md px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday || ""}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value || null })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship_status">Relationship Status</Label>
              <select
                id="relationship_status"
                value={formData.relationship_status || ""}
                onChange={(e) => setFormData({ ...formData, relationship_status: e.target.value || null })}
                className="flex h-10 w-full rounded-full border border-border/60 bg-card/60 backdrop-blur-md px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <option value="">Select status</option>
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="work">Work</Label>
                <Input id="work" value={formData.work || ""} onChange={(e) => setFormData({ ...formData, work: e.target.value })} placeholder="Where you work" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input id="education" value={formData.education || ""} onChange={(e) => setFormData({ ...formData, education: e.target.value })} placeholder="Where you studied" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={formData.location || ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="City, Country" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">Languages</Label>
              <Input id="languages" value={formData.languages || ""} onChange={(e) => setFormData({ ...formData, languages: e.target.value })} placeholder="Comma-separated languages" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests</Label>
              <Input id="interests" value={formData.interests || ""} onChange={(e) => setFormData({ ...formData, interests: e.target.value })} placeholder="Comma-separated interests" />
            </div>

            <div className="space-y-2">
              <Label>Profile Theme</Label>
              <div className="flex flex-wrap gap-2">
                {THEME_OPTIONS.map((theme) => (
                  <Button
                    key={theme.value}
                    variant={formData.profile_theme === theme.value ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setFormData({ ...formData, profile_theme: theme.value })}
                  >
                    {theme.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button variant="outline" className="rounded-full" onClick={onClose}>Cancel</Button>
            <Button className="rounded-full" onClick={handleSave} disabled={isSaving || !!usernameError || usernameChecking}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
