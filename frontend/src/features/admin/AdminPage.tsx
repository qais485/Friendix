import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Users, AlertTriangle, BarChart3,
  ToggleLeft, Ban, ClipboardList, Settings, UserCheck,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { UserManagement } from "./UserManagement";
import { ReportsManagement } from "./ReportsManagement";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { FeatureFlagsManagement } from "./FeatureFlagsManagement";
import { BannedUsersManagement } from "./BannedUsersManagement";
import { AuditLogsView } from "./AuditLogsView";
import { SystemSettingsView } from "./SystemSettingsView";
import { VerificationRequestsView } from "./VerificationRequestsView";

type AdminTab =
  | "analytics"
  | "users"
  | "reports"
  | "moderation"
  | "verifications"
  | "feature-flags"
  | "banned"
  | "audit-logs"
  | "settings";

const ADMIN_TABS = [
  { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
  { key: "users" as const, label: "Users", icon: Users },
  { key: "reports" as const, label: "Reports", icon: AlertTriangle },
  { key: "moderation" as const, label: "Moderation", icon: Shield },
  { key: "verifications" as const, label: "Verifications", icon: UserCheck },
  { key: "feature-flags" as const, label: "Feature Flags", icon: ToggleLeft },
  { key: "banned" as const, label: "Banned Users", icon: Ban },
  { key: "audit-logs" as const, label: "Audit Logs", icon: ClipboardList },
  { key: "settings" as const, label: "Settings", icon: Settings },
];

export function AdminPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center bg-card border border-border rounded-2xl p-8 shadow-card" role="alert">
          <Shield className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <motion.aside
          initial={false}
          animate={{ width: sidebarCollapsed ? 60 : 240 }}
          className="sticky top-0 hidden h-screen flex-shrink-0 border-r bg-card shadow-card md:block"
        >
          <div className="flex h-14 items-center border-b px-4">
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-bold tracking-tight"
              >
                <span className="text-gradient">Admin</span>
              </motion.span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                "rounded-xl p-1.5 hover:bg-muted transition-all duration-200 hover:shadow-elevated",
                sidebarCollapsed && "mx-auto"
              )}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!sidebarCollapsed}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className="space-y-1 px-2 py-4">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-elevated"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-card"
                )}
              >
                <tab.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{tab.label}</span>}
              </button>
            ))}
          </nav>
        </motion.aside>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 pt-12 md:pt-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 shadow-card">
                  <Shield className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Manage your platform</p>
                </div>
              </div>

              <div role="tablist" aria-label="Admin sections" className="flex gap-2 overflow-x-auto pb-1 md:hidden">
                {ADMIN_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    aria-controls={`admin-panel-${tab.key}`}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200",
                      activeTab === tab.key
                        ? "bg-primary text-primary-foreground shadow-elevated"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground shadow-card hover:shadow-elevated"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "analytics" && <AnalyticsDashboard />}
              {activeTab === "users" && <UserManagement />}
              {activeTab === "reports" && <ReportsManagement />}
              {activeTab === "moderation" && <ReportsManagement statusFilter="pending" />}
              {activeTab === "verifications" && <VerificationRequestsView />}
              {activeTab === "feature-flags" && <FeatureFlagsManagement />}
              {activeTab === "banned" && <BannedUsersManagement />}
              {activeTab === "audit-logs" && <AuditLogsView />}
              {activeTab === "settings" && <SystemSettingsView />}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
