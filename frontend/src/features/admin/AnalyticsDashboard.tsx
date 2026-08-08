import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users, UserCheck, FileText, MessageSquare, Mail,
  AlertTriangle, BadgeCheck, UserPlus, PenLine, Loader2,
} from "lucide-react";
import { adminApi } from "@/services/adminApi";
import { Card, CardContent } from "@/components/ui/card";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BarChart({ data }: { data: { label: string; value: number; max: number }[] }) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{item.value.toLocaleString()}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: item.max > 0 ? `${(item.value / item.max) * 100}%` : "0%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsDashboard() {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminApi.getAnalytics().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="py-12 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
        <p className="mt-2 text-sm text-muted-foreground">Failed to load analytics.</p>
      </Card>
    );
  }

  const maxStat = Math.max(analytics.total_users, analytics.total_posts, analytics.total_comments, analytics.total_messages);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Users" value={analytics.total_users} icon={Users} color="bg-blue-500/10 text-blue-600" />
        <StatCard label="Active Users" value={analytics.active_users} icon={UserCheck} color="bg-green-500/10 text-green-600" />
        <StatCard label="Posts" value={analytics.total_posts} icon={FileText} color="bg-purple-500/10 text-purple-600" />
        <StatCard label="Comments" value={analytics.total_comments} icon={MessageSquare} color="bg-orange-500/10 text-orange-600" />
        <StatCard label="Messages" value={analytics.total_messages} icon={Mail} color="bg-pink-500/10 text-pink-600" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold">{analytics.pending_reports}</p>
              <p className="text-xs text-muted-foreground">Pending Reports</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <BadgeCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold">{analytics.pending_verifications}</p>
              <p className="text-xs text-muted-foreground">Pending Verifications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
              <UserPlus className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold">{analytics.new_users_today}</p>
              <p className="text-xs text-muted-foreground">New Users Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
              <PenLine className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold">{analytics.new_posts_today}</p>
              <p className="text-xs text-muted-foreground">New Posts Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 font-semibold">Platform Overview</h3>
          <BarChart data={[
            { label: "Users", value: analytics.total_users, max: maxStat },
            { label: "Posts", value: analytics.total_posts, max: maxStat },
            { label: "Comments", value: analytics.total_comments, max: maxStat },
            { label: "Messages", value: analytics.total_messages, max: maxStat },
          ]} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
