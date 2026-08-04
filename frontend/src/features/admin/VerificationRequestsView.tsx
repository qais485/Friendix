import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck, ChevronDown, CheckCircle, XCircle,
  Loader2, AlertTriangle,
} from "lucide-react";
import { adminApi } from "@/services/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDistanceToNow } from "@/lib/utils";
import type { VerificationRequest } from "@/types";

const STATUS_OPTIONS = ["", "pending", "approved", "rejected"] as const;

export function VerificationRequestsView() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [cursors, setCursors] = useState<string[]>([]);
  const [reviewModal, setReviewModal] = useState<{ request: VerificationRequest; action: "approved" | "rejected" } | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const currentCursor = cursors[cursors.length - 1] ?? undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-verifications", status, currentCursor],
    queryFn: () => adminApi.getVerificationRequests(status || undefined, currentCursor).then((r) => r.data),
  });

  const reviewMutation = useMutation({
    mutationFn: (vars: { requestId: string; reviewStatus: string }) =>
      adminApi.reviewVerificationRequest(vars.requestId, vars.reviewStatus, reviewNotes || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
      setReviewModal(null);
      setReviewNotes("");
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
        <p className="mt-2 text-sm text-muted-foreground">Failed to load verification requests.</p>
      </Card>
    );
  }

  const requests = data?.requests ?? [];
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

      {requests.length === 0 ? (
        <Card className="py-12 text-center">
          <UserCheck className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">No verification requests found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                <div className="flex items-center gap-3">
                  <img
                    src={req.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.full_name || "U")}`}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{req.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">@{req.username || "—"}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">{req.reason}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      req.status === "pending" && "bg-yellow-500/10 text-yellow-600",
                      req.status === "approved" && "bg-green-500/10 text-green-600",
                      req.status === "rejected" && "bg-red-500/10 text-red-600"
                    )}>
                      {req.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(req.created_at))}</span>
                  </div>
                </div>
                {req.status === "pending" && (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => { setReviewNotes(""); setReviewModal({ request: req, action: "approved" }); }}>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => { setReviewNotes(""); setReviewModal({ request: req, action: "rejected" }); }}>
                      <XCircle className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => {
            const last = data?.requests[data.requests.length - 1]?.id;
            if (last) setCursors((p) => [...p, last]);
          }}>Load more</Button>
        </div>
      )}

      <AnimatePresence>
        {reviewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setReviewModal(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-2xl glass-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold capitalize">{reviewModal.action} Verification</h3>
              <p className="text-sm text-muted-foreground">@{reviewModal.request.username}</p>
              <textarea className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Review notes (optional)..." rows={3} value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setReviewModal(null)}>Cancel</Button>
                <Button variant={reviewModal.action === "rejected" ? "destructive" : "default"}
                  disabled={reviewMutation.isPending}
                  onClick={() => reviewMutation.mutate({ requestId: reviewModal.request.id, reviewStatus: reviewModal.action })}>
                  {reviewMutation.isPending ? "Saving..." : reviewModal.action === "approved" ? "Approve" : "Reject"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
