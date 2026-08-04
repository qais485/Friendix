import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ToggleLeft, Plus, Pencil, Trash2, Loader2, AlertTriangle,
} from "lucide-react";
import { adminApi } from "@/services/adminApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { FeatureFlag } from "@/types";

export function FeatureFlagsManagement() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editFlag, setEditFlag] = useState<FeatureFlag | null>(null);
  const [form, setForm] = useState({ key: "", name: "", description: "", rollout_percentage: 100 });

  const { data: flags, isLoading, error } = useQuery({
    queryKey: ["admin-feature-flags"],
    queryFn: () => adminApi.getFeatureFlags().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.createFeatureFlag(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-feature-flags"] }); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; data: { key: string; name: string; description?: string; rollout_percentage: number } }) =>
      adminApi.updateFeatureFlag(vars.id, vars.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-feature-flags"] }); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteFeatureFlag(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-feature-flags"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: (vars: { id: string; is_enabled: boolean }) => adminApi.updateFeatureFlag(vars.id, { is_enabled: vars.is_enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-feature-flags"] }),
  });

  function resetForm() {
    setForm({ key: "", name: "", description: "", rollout_percentage: 100 });
    setShowForm(false);
    setEditFlag(null);
  }

  function startEdit(flag: FeatureFlag) {
    setEditFlag(flag);
    setForm({ key: flag.key, name: flag.name, description: flag.description ?? "", rollout_percentage: flag.rollout_percentage });
    setShowForm(true);
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (error) {
    return <Card className="py-12 text-center"><AlertTriangle className="mx-auto h-8 w-8 text-destructive" /><p className="mt-2 text-sm text-muted-foreground">Failed to load feature flags.</p></Card>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Feature Flags</h3>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <Plus className="mr-1.5 h-4 w-4" /> New Flag
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <Card className="overflow-hidden">
              <CardContent className="space-y-3 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Key (e.g. dark_mode)" value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} disabled={!!editFlag} />
                  <Input placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <Input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted-foreground">Rollout: {form.rollout_percentage}%</label>
                  <input type="range" min={0} max={100} value={form.rollout_percentage}
                    onChange={(e) => setForm((f) => ({ ...f, rollout_percentage: Number(e.target.value) }))} className="flex-1" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
                  <Button size="sm" disabled={!form.key.trim() || !form.name.trim() || createMutation.isPending || updateMutation.isPending}
                    onClick={() => editFlag ? updateMutation.mutate({ id: editFlag.id, data: form }) : createMutation.mutate()}>
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : editFlag ? "Update" : "Create"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!flags?.length ? (
        <Card className="py-12 text-center">
          <ToggleLeft className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">No feature flags yet.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {flags.map((flag) => (
            <Card key={flag.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <Switch checked={flag.is_enabled} onCheckedChange={(checked) => toggleMutation.mutate({ id: flag.id, is_enabled: checked })} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{flag.name}</p>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{flag.key}</code>
                  </div>
                  {flag.description && <p className="mt-0.5 text-xs text-muted-foreground truncate">{flag.description}</p>}
                  <p className="mt-0.5 text-xs text-muted-foreground">Rollout: {flag.rollout_percentage}%</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(flag)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                    onClick={() => { if (confirm("Delete this flag?")) deleteMutation.mutate(flag.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
