import { NavLink } from "react-router-dom";
import { Home, Users, User, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const BOTTOM_NAV_ITEMS = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/friends", label: "Friends", icon: Users },
] as const;

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/10 md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-4 py-2 text-[10px] font-semibold transition-all duration-200 rounded-2xl",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                  isActive && "bg-gradient-to-br from-primary/15 to-purple-500/10 shadow-sm"
                )}>
                  <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                </div>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
