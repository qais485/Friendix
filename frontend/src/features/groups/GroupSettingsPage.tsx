import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Trash2, Loader2, Globe, Lock, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroupDetail, useUpdateGroup, useDeleteGroup } from "./hooks";
import type { GroupPrivacy } from "@/types";

export function GroupSettingsPage() {
  const { slug } = useParams<{ slug: string }>();
  const groupSlug = slug || "";
  const navigate = useNavigate();
  const { data: group, isPending } = useGroupDetail(groupSlug);
  const updateMutation = useUpdateGroup();
  const deleteMutation = useDeleteGroup();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<GroupPrivacy>("public");
  const [rules, setRules] = useState("");

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || "");
      setPrivacy(group.privacy);
      setRules(group.rules || "");
    }
  }, [group]);

  const handleSave = () => {
    updateMutation.mutate(
      { slug: groupSlug, name, description: description || undefined, privacy, rules: rules || undefined },
      { onSuccess: () => navigate(`/groups/${groupSlug}`) }
    );
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this group? This cannot be undone.")) {
      deleteMutation.mutate(groupSlug, { onSuccess: () => navigate("/groups") });
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!group || group.member_role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="rounded-3xl glass-card p-10 text-center">
            <p className="text-base font-medium text-foreground">Access denied</p>
            <p className="mt-1.5 text-sm text-muted-foreground">Only group admins can manage settings.</p>
            <Link to={`/groups/${groupSlug}`}>
              <Button variant="outline" className="mt-5 rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Group
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="pt-12 md:pt-0">
            <Link
              to={`/groups/${groupSlug}`}
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {group.name}
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-gradient">Group Settings</h1>
          </div>

          <div className="space-y-5 rounded-2xl glass-card p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium block">Group Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border bg-background px-4 py-3 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 hover:shadow-elevated"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border bg-background px-4 py-3 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all duration-200 hover:shadow-elevated"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">Privacy</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "public" as const, label: "Public", icon: Globe },
                  { value: "private" as const, label: "Private", icon: Lock },
                  { value: "hidden" as const, label: "Hidden", icon: EyeOff },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPrivacy(opt.value)}
                    className={`rounded-2xl glass-card p-4 text-center transition-all duration-200 ${
                      privacy === opt.value
                        ? "border-primary bg-primary/10 text-primary shadow-card"
                        : "hover:bg-muted hover:shadow-card"
                    }`}
                  >
                    <opt.icon className="mx-auto h-5 w-5 mb-1.5" />
                    <p className="text-xs font-medium">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">Group Rules</label>
              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                rows={4}
                className="w-full rounded-xl border bg-background px-4 py-3 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all duration-200 hover:shadow-elevated"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl hover:shadow-elevated transition-all duration-200"
              onClick={() => navigate(`/groups/${groupSlug}`)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl shadow-card hover:shadow-elevated transition-all duration-200"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>

          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 shadow-card p-6">
            <h3 className="font-bold text-destructive">Danger Zone</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Deleting this group will remove all members, messages, events, and polls. This action cannot be undone.
            </p>
            <Button
              variant="destructive"
              className="mt-4 rounded-xl hover:shadow-elevated transition-all duration-200"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete Group
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
