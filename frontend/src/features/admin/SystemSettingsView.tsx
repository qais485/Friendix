import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Settings, Plus, Pencil, Trash2, Loader2, AlertTriangle, ChevronDown,
} from "lucide-react";
import { adminApi } from "@/services/adminApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SystemSetting } from "@/types";

const CATEGORIES = ["", "general", "auth", "moderation", "notifications", "appearance"] as const;

export function SystemSettingsView() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editSetting, setEditSetting] = useState<SystemSetting | null>(null);
  const [form, setForm] = useState({ key: "", value: "", description: "", category: "general" });

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["admin-settings", category],
    queryFn: () => adminApi.getSystemSettings(category || undefined).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.createSystemSetting(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-settings"] }); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { key: string; data: { value?: string; description?: string; category?: string } }) =>
      adminApi.updateSystemSetting(vars.key, vars.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-settings"] }); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => adminApi.deleteSystemSetting(key),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-settings"] }),
  });

  function resetForm() {
    setForm({ key: "", value: "", description: "", category: "general" });
    setShowForm(false);
    setEditSetting(null);
  }

  function startEdit(s: SystemSetting) {
    setEditSetting(s);
    setForm({ key: s.key, value: s.value, description: s.description ?? "", category: s.category });
    setShowForm(true);
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (error) {
    return <Card className="py-12 text-center"><AlertTriangle className="mx-auto h-8 w-8 text-destructive" /><p className="mt-2 text-sm text-muted-foreground">Failed to load settings.</p></Card>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c || "All Categories"}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <Plus className="mr-1.5 h-4 w-4" /> New Setting
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <Card className="overflow-hidden">
              <CardContent className="space-y-3 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Key" value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} disabled={!!editSetting} />
                  <Input placeholder="Value" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
                </div>
                <Input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                <div className="relative">
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 pr-8 text-sm">
                    {CATEGORIES.filter(Boolean).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
                  <Button size="sm" disabled={!form.key.trim() || !form.value.trim() || createMutation.isPending || updateMutation.isPending}
                    onClick={() => editSetting ? updateMutation.mutate({ key: editSetting.key, data: form }) : createMutation.mutate()}>
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : editSetting ? "Update" : "Create"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!settings?.length ? (
        <Card className="py-12 text-center">
          <Settings className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">No settings found.</p>
        </Card>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {settings.map((s) => (
              <Card key={s.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-mono text-xs font-medium">{s.key}</p>
                      <p className="mt-0.5 break-words text-sm text-muted-foreground">{s.value}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs">{s.category}</span>
                  </div>
                  {s.description && (
                    <p className="break-words text-xs text-muted-foreground">{s.description}</p>
                  )}
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(s)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                      onClick={() => { if (confirm(`Delete setting "${s.key}"?`)) deleteMutation.mutate(s.key); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="hidden md:block">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Key</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium font-mono text-xs">{s.key}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">{s.value}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">{s.description || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{s.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(s)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                          onClick={() => { if (confirm(`Delete setting "${s.key}"?`)) deleteMutation.mutate(s.key); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
