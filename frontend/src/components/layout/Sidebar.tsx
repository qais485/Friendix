import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Shield,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Radio,
  Menu,
  X,
  Settings,
  ShieldCheck,
  Hash,
  UsersRound,
  CalendarDays,
  PlayCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import type { User as UserType } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { NotificationBell } from "@/features/notifications";
import { useLayout } from "./AppLayout";
import { LiquidGlassActiveIndicator } from "@/components/liquid-glass";

const NAV_ITEMS = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/live", label: "Live", icon: Radio },
  { to: "/groups", label: "Groups", icon: UsersRound },
  { to: "/events", label: "Events", icon: CalendarDays },
  { to: "/videos", label: "Videos", icon: PlayCircle },
  { to: "/hashtags", label: "Hashtags", icon: Hash },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function Sidebar() {
  const { sidebarCollapsed: collapsed, setSidebarCollapsed: setCollapsed, mobileMenuOpen, setMobileMenuOpen } = useLayout();
  const { user, logout } = useAuthStore();

  const handleNavClick = () => {
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed left-4 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-2xl glass-card shadow-elevated md:hidden"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed left-0 top-0 z-40 flex h-full w-[260px] flex-col glass-strong shadow-float md:hidden"
          >
            <SidebarContent
              collapsed={false}
              user={user}
              onLogout={logout}
              onNavClick={handleNavClick}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed left-0 top-0 z-40 hidden h-full flex-col glass-strong shadow-float md:flex"
      >
        <SidebarContent
          collapsed={collapsed}
          user={user}
          onLogout={logout}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onNavClick={handleNavClick}
        />
      </motion.aside>
    </>
  );
}

function SidebarContent({
  collapsed,
  user,
  onLogout,
  onToggleCollapse,
  onNavClick,
}: {
  collapsed: boolean;
  user: UserType | null;
  onLogout: () => void;
  onToggleCollapse?: () => void;
  onNavClick?: () => void;
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <div className="flex h-16 items-center border-b border-white/10 px-4">
        {!collapsed ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-black tracking-tight text-gradient"
          >
            Friendix
          </motion.span>
        ) : (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-500 text-white text-sm font-bold shadow-glow">
            F
          </div>
        )}
        <div className="ml-auto flex items-center gap-1">
          {!collapsed && <NotificationBell />}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("rounded-xl", collapsed && "mx-auto")}
              onClick={onToggleCollapse}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      <nav className="relative flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <LiquidGlassActiveIndicator />
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                "relative z-10 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:backdrop-blur-sm"
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="pt-4"
          >
            <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground/50">
              Account
            </p>
            <NavLink
              to="/settings/privacy"
              onClick={onNavClick}
              className={({ isActive }) =>
                cn(
                  "relative z-10 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:backdrop-blur-sm"
                )
              }
            >
              <Shield className="h-5 w-5 flex-shrink-0" />
              <span>Privacy Settings</span>
            </NavLink>
            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                onClick={onNavClick}
                className={({ isActive }) =>
                  cn(
                    "relative z-10 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:backdrop-blur-sm"
                  )
                }
              >
                <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                <span>Admin Panel</span>
              </NavLink>
            )}
          </motion.div>
        )}
      </nav>

      <div className="border-t border-white/10 px-3 py-3">
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 transition-all hover:bg-muted/50 hover:backdrop-blur-sm"
            >
              <Avatar
                src={user.avatar_url}
                alt={user.full_name || "User"}
                fallback={(user.full_name || user.email || "U")[0].toUpperCase()}
                size="sm"
              />
              {!collapsed && (
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-bold">
                    {user.full_name || "User"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{user.username || user.email?.split("@")[0]}
                  </p>
                </div>
              )}
            </button>

            <AnimatePresence>
              {showUserMenu && !collapsed && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl glass-card shadow-float p-1.5"
                >
                  <NavLink
                    to="/profile"
                    onClick={() => { setShowUserMenu(false); onNavClick?.(); }}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-muted/50 rounded-xl"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </NavLink>
                  <NavLink
                    to="/settings/privacy"
                    onClick={() => { setShowUserMenu(false); onNavClick?.(); }}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-muted/50 rounded-xl"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </NavLink>
                  <div className="my-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  <button
                    onClick={() => { setShowUserMenu(false); onLogout(); }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 rounded-xl"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        {!collapsed && !showUserMenu && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive rounded-2xl"
            onClick={() => onLogout()}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        )}
      </div>
    </>
  );
}
