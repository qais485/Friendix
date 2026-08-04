import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle, ChevronDown, CheckCircle, XCircle,
  Loader2, MessageSquare,
} from "lucide-react";
import { adminApi } from "@/services/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDistanceToNow } from "@/lib/utils";
import type { Report } from "@/types";

interface Props {
  statusFilter?: string;
}

const STATUS_OPTIONS = ["", "pending", "resolved", "dismissed"] as const;

export function ReportsManagement({ statusFilter: initialStatus }: Props = {}) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(initialStatus ?? "");
  const [cursors, setCursors] = useState<string[]>([]);
  const [resolveModal, setResolveModal] = useState<Report | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const currentCursor = cursors[cursors.length - 1] ?? undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-reports", status, currentCursor],
    queryFn: () => adminApi.getReports(status || undefined, currentCursor).then((r) => r.data),
  });

  const resolveMutation = useMutation({
    mutationFn: (vars: { reportId: string; reportStatus: string }) =>
      adminApi.resolveReport(vars.reportId, vars.reportStatus, resolutionNotes || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      setResolveModal(null);
      setResolutionNotes("");
    },
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
        <p className="mt-2 text-sm text-muted-foreground">Failed to load reports.</p>
      </Card>
    );
  }

  const reports = data?.reports ?? [];
  const hasMore = data?.has_more ?? false;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setCursors([]); }}
            className="h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s || "All Statuses"}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {reports.length === 0 ? (
        <Card className="py-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">No reports found.</p>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Reporter</th>
                  <th className="px-4 py-3 font-medium">Reported User</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{report.reporter_name || "—"}</td>
                    <td className="px-4 py-3">{report.reported_user_name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{report.entity_type}</span>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">{report.reason}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          report.status === "pending" && "bg-yellow-500/10 text-yellow-600",
                          report.status === "resolved" && "bg-green-500/10 text-green-600",
                          report.status === "dismissed" && "bg-gray-500/10 text-gray-600"
                        )}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDistanceToNow(new Date(report.created_at))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {report.status === "pending" && (
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Resolve"
                            onClick={() => { setResolveModal(report); setResolutionNotes(""); }}>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Dismiss"
                            onClick={() => resolveMutation.mutate({ reportId: report.id, reportStatus: "dismissed" })}>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => {
            const last = data?.reports[data.reports.length - 1]?.id;
            if (last) setCursors((p) => [...p, last]);
          }}>Load more</Button>
        </div>
      )}

      <AnimatePresence>
        {resolveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setResolveModal(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-2xl glass-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold">Resolve Report</h3>
              <textarea className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Resolution notes (optional)..." rows={3} value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} />
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setResolveModal(null)}>Cancel</Button>
                <Button disabled={resolveMutation.isPending}
                  onClick={() => resolveMutation.mutate({ reportId: resolveModal.id, reportStatus: "resolved" })}>
                  {resolveMutation.isPending ? "Resolving..." : "Resolve"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
