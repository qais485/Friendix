import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Palette, RotateCcw } from "lucide-react";
import { adminApi } from "@/services/adminApi";
import { APPEARANCE_QUERY_KEY, type PostCardBarMode } from "@/hooks/useAppearanceSettings";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const APPEARANCE_CATEGORY = "appearance";

const MODES: { value: PostCardBarMode; label: string; description: string }[] = [
  { value: "glass", label: "Liquid Glass", description: "Current liquid-glass blur + refraction effect" },
  { value: "solid", label: "Solid color", description: "Solid opaque background color" },
  { value: "none", label: "None", description: "No bar / transparent overlay" },
];

type SectionAppearance = { mode: PostCardBarMode; color: string };
type AppearanceForm = { header: SectionAppearance; footer: SectionAppearance };

const DEFAULT_COLOR = "#000000";

const BAR_KEYS: { key: keyof AppearanceForm; modeKey: string; colorKey: string }[] = [
  { key: "header", modeKey: "postcard_header_mode", colorKey: "postcard_header_color" },
  { key: "footer", modeKey: "postcard_footer_mode", colorKey: "postcard_footer_color" },
];

export function PostcardAppearanceView() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AppearanceForm>({
    header: { mode: "glass", color: DEFAULT_COLOR },
    footer: { mode: "glass", color: DEFAULT_COLOR },
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings", APPEARANCE_CATEGORY],
    queryFn: () => adminApi.getSystemSettings(APPEARANCE_CATEGORY).then((r) => r.data),
  });

  useEffect(() => {
    if (!settings) return;
    const byKey = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const existing = Object.keys(byKey);
    function read(key: keyof AppearanceForm): SectionAppearance {
      const meta = BAR_KEYS.find((b) => b.key === key)!;
      const mode = (byKey[meta.modeKey] as PostCardBarMode | undefined) ?? "glass";
      return {
        mode: ["glass", "solid", "none"].includes(mode) ? mode : "glass",
        color: byKey[meta.colorKey] || DEFAULT_COLOR,
      };
    }
    setForm({ header: read("header"), footer: read("footer") });
    setExistingKeys(existing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const [existingKeys, setExistingKeys] = useState<string[]>([]);

  const saveMutation = useMutation({
    mutationFn: async (values: AppearanceForm) => {
      for (const bar of BAR_KEYS) {
        const { modeKey, colorKey } = bar;
        const writeMode = { key: modeKey, value: values[bar.key].mode, category: APPEARANCE_CATEGORY };
        const writeColor = { key: colorKey, value: values[bar.key].color, category: APPEARANCE_CATEGORY };
        if (existingKeys.includes(modeKey)) await adminApi.updateSystemSetting(modeKey, { value: writeMode.value, category: APPEARANCE_CATEGORY });
        else await adminApi.createSystemSetting(writeMode);
        if (existingKeys.includes(colorKey)) await adminApi.updateSystemSetting(colorKey, { value: writeColor.value, category: APPEARANCE_CATEGORY });
        else await adminApi.createSystemSetting(writeColor);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: APPEARANCE_QUERY_KEY });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-6 p-5">
          {(["header", "footer"] as const).map((barKey) => (
            <div key={barKey} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold capitalize">{barKey} bar</h3>
                <div className="flex flex-wrap gap-2">
                  {MODES.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, [barKey]: { ...f[barKey], mode: m.value } }))}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                        form[barKey].mode === m.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {MODES.find((m) => m.value === form[barKey].mode)?.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-end gap-3">
                  <div className="grow space-y-1.5">
                    <Label className="text-xs">Solid color</Label>
                    <Input
                      type="color"
                      value={form[barKey].color}
                      onChange={(e) => setForm((f) => ({ ...f, [barKey]: { ...f[barKey], color: e.target.value } }))}
                      className="h-10 w-full cursor-pointer p-1"
                      aria-label="Solid color"
                    />
                  </div>
                  <div className="grow-[2] space-y-1.5">
                    <Label className="text-xs">Hex value</Label>
                    <Input
                      value={form[barKey].color}
                      onChange={(e) => setForm((f) => ({ ...f, [barKey]: { ...f[barKey], color: e.target.value } }))}
                      className="h-10"
                    />
                  </div>
                </div>
                <div aria-hidden className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Preview</Label>
                  <div
                    className={cn(
                      "h-8 flex-1 rounded-lg border border-border",
                      form[barKey].mode === "none" && "bg-transparent"
                    )}
                    style={form[barKey].mode === "solid" ? { backgroundColor: form[barKey].color } : {}}
                  >
                    {form[barKey].mode === "glass" && (
                      <div className="liquid-glass h-full w-full rounded-lg" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setForm({ header: { mode: "glass", color: DEFAULT_COLOR }, footer: { mode: "glass", color: DEFAULT_COLOR } })}>
          <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
        </Button>
        <Button size="sm" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(form)}>
          {saveMutation.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Check className="mr-1.5 h-4 w-4" />}
          Save Appearance
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        <Palette className="mr-1 inline h-3.5 w-3.5" />
        Changes apply to post card header and footer bars across the platform and update live once saved.
      </p>
    </div>
  );
}
