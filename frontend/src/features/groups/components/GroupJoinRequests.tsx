import { motion } from "framer-motion";
import { UserCheck, UserX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroupJoinRequests, useHandleJoinRequest } from "../hooks";
import { formatDistanceToNow } from "@/lib/utils";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";
import type { Group } from "@/types";

interface GroupJoinRequestsProps {
  group: Group;
}

export function GroupJoinRequests({ group }: GroupJoinRequestsProps) {
  const { data: requests, isPending } = useGroupJoinRequests(group.slug);
  const handleMutation = useHandleJoinRequest();

  if (isPending) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="rounded-3xl glass-card p-8 text-center">
        <UserCheck className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">No pending requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {requests.map((req, i) => (
        <motion.div
          key={req.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-center gap-3 rounded-2xl glass-card p-3"
        >
          {req.avatar_url ? (
            <img
              src={getCloudinaryTransformedUrl(req.avatar_url, "avatar")}
              alt=""
              width={40}
              height={40}
              loading="lazy"
              decoding="async"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {(req.username || "U")[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{req.full_name || req.username}</p>
            {req.message && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{req.message}</p>
            )}
            <p className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(req.created_at))}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => handleMutation.mutate({ slug: group.slug, requestId: req.id, status: "approved" })}
              disabled={handleMutation.isPending}
            >
              <UserCheck className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMutation.mutate({ slug: group.slug, requestId: req.id, status: "rejected" })}
              disabled={handleMutation.isPending}
              className="text-destructive hover:bg-destructive/10"
            >
              <UserX className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
