import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronDown, Shield, UserX, Ban,
  AlertTriangle, Loader2, Users,
} from "lucide-react";
import { adminApi } from "@/services/adminApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDistanceToNow } from "@/lib/utils";
import type { AdminUser } from "@/types";

const ROLES = ["user", "moderator", "admin"] as const;

export function UserManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [cursors, setCursors] = useState<string[]>([]);
  const [banModal, setBanModal] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState("");

  const currentCursor = cursors[cursors.length - 1] ?? undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users", search, roleFilter, currentCursor],
    queryFn: () => adminApi.getUsers(search || undefined, roleFilter || undefined, currentCursor).then((r) => r.data),
  });

  const roleMutation = useMutation({
    mutationFn: (vars: { userId: string; role: string }) => adminApi.updateUserRole(vars.userId, vars.role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const activeMutation = useMutation({
    mutationFn: (vars: { userId: string; isActive: boolean }) => adminApi.toggleUserActive(vars.userId, vars.isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const banMutation = useMutation({
    mutationFn: () => {
      if (!banModal) throw new Error("No user selected");
      return adminApi.banUser(banModal.id, banReason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setBanModal(null);
      setBanReason("");
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
        <p className="mt-2 text-sm text-muted-foreground">Failed to load users.</p>
      </Card>
    );
  }

  const users = data?.users ?? [];
  const hasMore = data?.has_more ?? false;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm"
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {users.length === 0 ? (
        <Card className="py-12 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">No users found.</p>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getCloudinaryTransformedUrl(user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username || "U")}`, "avatar")}
                          alt=""
                          width={32}
                          height={32}
                          loading="lazy"
                          decoding="async"
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{user.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">@{user.username || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => roleMutation.mutate({ userId: user.id, role: e.target.value })}
                        className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          user.is_active ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                        )}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDistanceToNow(new Date(user.created_at))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title={user.is_active ? "Deactivate" : "Activate"}
                          onClick={() => activeMutation.mutate({ userId: user.id, isActive: !user.is_active })}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          title="Ban"
                          onClick={() => setBanModal(user)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
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
          <Button
            variant="outline"
            onClick={() => {
              const lastCursor = data?.users[data.users.length - 1]?.id;
              if (lastCursor) setCursors((prev) => [...prev, lastCursor]);
            }}
          >
            Load more
          </Button>
        </div>
      )}

      <AnimatePresence>
        {banModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setBanModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-2xl glass-card p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <Shield className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-bold">Ban User</h3>
                  <p className="text-sm text-muted-foreground">@{banModal.username}</p>
                </div>
              </div>
              <textarea
                className="mt-4 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Reason for ban..."
                rows={3}
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setBanModal(null)}>Cancel</Button>
                <Button
                  variant="destructive"
                  disabled={!banReason.trim() || banMutation.isPending}
                  onClick={() => banMutation.mutate()}
                >
                  {banMutation.isPending ? "Banning..." : "Ban User"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
