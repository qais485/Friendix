import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/features/notifications";

export function FloatingActions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div className="fixed top-3 right-4 z-50 flex items-center gap-2 md:right-4">
      <AnimatePresence>
        {searchOpen && (
          <motion.form
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onSubmit={handleSearchSubmit}
            className="overflow-hidden"
          >
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Friendix..."
                className="w-full rounded-full glass-card py-2.5 pl-10 pr-10 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 shadow-elevated transition-all"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full"
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <Button
        variant="glass"
        size="icon"
        className="shadow-elevated"
        onClick={() => setSearchOpen(!searchOpen)}
        aria-label="Search"
      >
        <Search className="h-[18px] w-[18px]" />
      </Button>

      <Button
        variant="glass"
        size="icon"
        className="shadow-elevated"
        onClick={() => navigate("/messages")}
        aria-label="Messages"
      >
        <MessageSquare className="h-[18px] w-[18px]" />
      </Button>

      <NotificationBell />
    </div>
  );
}
