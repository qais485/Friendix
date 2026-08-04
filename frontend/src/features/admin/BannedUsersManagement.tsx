import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, Loader2, AlertTriangle, ShieldOff, User } from "lucide-react";
import { adminApi } from "@/services/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDistanceToNow } from "@/lib/utils";
import type { BannedUser } from "@/types";

export function BannedUsersManagement() {
  const queryClient = useQueryClient();
  const [cursors, setCursors] = useState<string[]>([]);
  const currentCursor = cursors[cursors.length - 1] ?? undefined;

  const { data: bannedUsers, isLoading, error } = useQuery({
    queryKey: ["admin-banned-users", currentCursor],
    queryFn: () => adminApi.getBannedUsers(currentCursor).then((r) => r.data),
  });

  const unbanMutation = useMutation({
    mutationFn: (banId: string) => adminApi.unbanUser(banId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-banned-users"] }),
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
        <p className="mt-2 text-sm text-muted-foreground">Failed to load banned users.</p>
      </Card>
    );
  }

  const users = bannedUsers ?? [];

  function formatExpiry(user: BannedUser) {
    if (user.is_permanent) return "Permanent";
    if (!user.expires_at) return "—";
    return new Date(user.expires_at) < new Date() ? (
      <span className="text-destructive">Expired</span>
    ) : (
      formatDistanceToNow(new Date(user.expires_at))
    );
  }

  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <Card className="py-12 text-center">
          <Ban className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">No banned users.</p>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Banned By</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Expires</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((banned) => (
                  <tr key={banned.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{banned.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">@{banned.username || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">{banned.reason}</td>
                    <td className="px-4 py-3 text-muted-foreground">{banned.banned_by_id ? "Admin" : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        banned.is_permanent ? "bg-red-500/10 text-red-600" : "bg-yellow-500/10 text-yellow-600"
                      )}>
                        {banned.is_permanent ? "Permanent" : "Temporary"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatExpiry(banned)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground hover:text-foreground"
                        onClick={() => { if (confirm(`Unban @${banned.username}?`)) unbanMutation.mutate(banned.id); }}
                      >
                        <ShieldOff className="h-4 w-4" />
                        Unban
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {users.length >= 20 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => {
            const last = users[users.length - 1]?.id;
            if (last) setCursors((p) => [...p, last]);
          }}>Load more</Button>
        </div>
      )}
    </div>
  );
}
