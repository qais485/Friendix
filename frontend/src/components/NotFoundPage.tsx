import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="relative inline-block">
          <span className="text-8xl font-bold text-gradient select-none">404</span>
        </div>
        <h2 className="mt-6 text-2xl font-bold">Page not found</h2>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto leading-relaxed">
          The page you're looking for doesn't exist or has been moved to a different location.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" className="rounded-full" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Link to="/home">
            <Button className="rounded-full">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
