import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, ChevronDown, Loader2, AlertTriangle } from "lucide-react";
import { adminApi } from "@/services/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "@/lib/utils";

const ACTIONS = ["", "role_change", "user_ban", "user_unban", "report_resolve", "feature_flag_change", "setting_change"] as const;

export function AuditLogsView() {
  const [action, setAction] = useState("");
  const [cursors, setCursors] = useState<string[]>([]);
  const currentCursor = cursors[cursors.length - 1] ?? undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-audit-logs", action, currentCursor],
    queryFn: () => adminApi.getAuditLogs(action || undefined, currentCursor).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="py-12 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
        <p className="mt-2 text-sm text-muted-foreground">Failed to load audit logs.</p>
      </Card>
    );
  }

  const logs = data?.logs ?? [];
  const hasMore = data?.has_more ?? false;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setCursors([]); }}
            className="h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm"
          >
            {ACTIONS.map((a) => (
              <option key={a} value={a}>{a || "All Actions"}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {logs.length === 0 ? (
        <Card className="py-12 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">No audit logs found.</p>
        </Card>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-medium">{log.admin_name || "—"}</p>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{log.action}</span>
                  </div>
                  <p className="break-words text-sm text-muted-foreground">
                    {log.details_json || "—"}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Entity: {log.entity_type}</span>
                    <span>Target: {log.target_user_name || "—"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at))}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="hidden md:block">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Admin</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">Target User</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{log.admin_name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{log.entity_type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{log.target_user_name || "—"}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
                      {log.details_json || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
          </Card>
        </>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => {
            const last = logs[logs.length - 1]?.id;
            if (last) setCursors((p) => [...p, last]);
          }}>Load more</Button>
        </div>
      )}
    </div>
  );
}
