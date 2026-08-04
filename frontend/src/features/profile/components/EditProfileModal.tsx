import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  }, [profile]);

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
    setIsSaving(true);
    try { await onSave(formData); onClose(); } finally { setIsSaving(false); }
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
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-card p-6 shadow-float"
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

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" className="rounded-full" onClick={onClose}>Cancel</Button>
            <Button className="rounded-full" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
