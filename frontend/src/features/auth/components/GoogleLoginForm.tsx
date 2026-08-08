import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme: string;
              size: string;
              width: number;
              text: string;
            }
          ) => void;
        };
      };
    };
  }
}

export function GoogleLoginForm() {
  const { loginWithGoogle, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [buttonWidth, setButtonWidth] = useState(300);
  const buttonWidthRef = useRef(300);

  const renderGoogleButton = () => {
    if (!window.google || !googleButtonRef.current) return;
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      width: buttonWidthRef.current,
      text: "continue_with",
    });
  };

  useEffect(() => {
    const measure = () => {
      const el = googleButtonRef.current;
      if (!el) return;
      const w = el.parentElement ? el.parentElement.clientWidth : 300;
      const next = Math.max(200, Math.min(300, w));
      buttonWidthRef.current = next;
      setButtonWidth(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    const parent = googleButtonRef.current?.parentElement;
    if (parent) ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    renderGoogleButton();
  }, [buttonWidth]);

  const handleGoogleResponse = async (response: { credential: string }) => {
    setError("");
    try {
      await loginWithGoogle(response.credential);
      navigate("/");
    } catch {
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("Google Client ID is not configured.");
      return;
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
        });
        if (googleButtonRef.current) {
          renderGoogleButton();
        }
        setScriptLoaded(true);
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
        });
        if (googleButtonRef.current) {
          renderGoogleButton();
        }
        setScriptLoaded(true);
      }
    };
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (scriptToRemove && document.head.contains(scriptToRemove)) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-gradient-to-br from-background via-background to-primary/5 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary text-primary-foreground text-xl font-bold mb-4"
          >
            F
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-3xl font-bold tracking-tight"
          >
            Welcome to <span className="text-gradient">Friendix</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-3 text-muted-foreground"
          >
            Your social platform, reimagined.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="rounded-2xl glass-card/80 backdrop-blur-xl p-8 shadow-float"
        >
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-[44px] w-full max-w-[300px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div ref={googleButtonRef} className="w-full max-w-[300px]" />
            )}

            {!scriptLoaded && !isLoading && !error && (
              <div className="flex items-center justify-center h-[44px] w-full max-w-[300px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
            <p>
              By continuing, you agree to our{" "}
              <a href="#" className="underline hover:text-foreground transition-colors underline-offset-2">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-foreground transition-colors underline-offset-2">
                Privacy Policy
              </a>
            </p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-8 text-center text-xs text-muted-foreground/50"
        >
          Friendix &copy; {new Date().getFullYear()}
        </motion.p>
      </motion.div>
    </div>
  );
}
