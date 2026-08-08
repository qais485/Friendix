import { useState, createContext, useContext, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { RightSidebar } from "./RightSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { FloatingActions } from "./FloatingActions";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType>({
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  mobileMenuOpen: false,
  setMobileMenuOpen: () => {},
});

export function useLayout() {
  return useContext(LayoutContext);
}

interface AppLayoutProps {
  children: React.ReactNode;
  showRightSidebar?: boolean;
}

export function AppLayout({ children, showRightSidebar = true }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen, isMobile]);

  return (
    <LayoutContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen }}>
      <div className="min-h-screen bg-background">
        <Sidebar />

        <AnimatePresence>
          {isMobile && mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-md md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        <div className="flex min-h-screen">
          <FloatingActions />
          <main
            className={`min-h-screen min-w-0 flex-1 transition-[margin] duration-250 ease-in-out ${
              isMobile
                ? "ml-0 mb-16"
                : sidebarCollapsed
                ? "md:ml-[72px]"
                : "md:ml-[256px]"
            }`}
          >
            {children}
          </main>

          {!isMobile && showRightSidebar && (
            <aside className="hidden w-[320px] shrink-0 border-l border-white/10 glass/30 lg:block">
              <RightSidebar />
            </aside>
          )}
        </div>

        {isMobile && <MobileBottomNav />}
      </div>
    </LayoutContext.Provider>
  );
}
