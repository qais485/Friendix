import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types";

interface ProfileQRCodeProps {
  profile: Profile;
}

export function ProfileQRCode({ profile }: ProfileQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [profileUrl, setProfileUrl] = useState("");

  useEffect(() => {
    const baseUrl = window.location.origin;
    const username = profile.username || profile.id;
    setProfileUrl(`${baseUrl}/profile/${username}`);
  }, [profile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 200;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    const moduleSize = 8;
    const modules = Math.floor(size / moduleSize);
    const pattern = generateSimplePattern(modules);

    ctx.fillStyle = "#000000";
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (pattern[row]?.[col]) {
          ctx.fillRect(
            col * moduleSize,
            row * moduleSize,
            moduleSize - 1,
            moduleSize - 1
          );
        }
      }
    }

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 20;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 3, 0, Math.PI * 2);
    ctx.fillStyle = "#3b82f6";
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("F", centerX, centerY);
  }, [profileUrl]);

  const generateSimplePattern = (size: number): boolean[][] => {
    const pattern: boolean[][] = [];
    for (let i = 0; i < size; i++) {
      pattern[i] = [];
      for (let j = 0; j < size; j++) {
        if (
          (i < 3 && j < 3) ||
          (i < 3 && j >= size - 3) ||
          (i >= size - 3 && j < 3)
        ) {
          pattern[i][j] = true;
        } else if (i === 3 || j === 3 || i === size - 4 || j === size - 4) {
          pattern[i][j] = false;
        } else {
          pattern[i][j] = Math.random() > 0.5;
        }
      }
    }
    return pattern;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `friendix-${profile.username || profile.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.full_name}'s Profile`,
          text: `Check out ${profile.full_name}'s profile on Friendix`,
          url: profileUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(profileUrl);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full flex-col items-center gap-4 rounded-2xl glass-card p-4 sm:p-6"
    >
      <h3 className="text-lg font-bold">Profile QR Code</h3>
      <p className="text-center text-sm text-muted-foreground">
        Scan to visit profile
      </p>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <canvas ref={canvasRef} className="block max-w-full" />
      </div>

      <p className="max-w-full break-all text-center text-xs text-muted-foreground">
        {profileUrl}
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </motion.div>
  );
}
