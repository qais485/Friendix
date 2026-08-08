import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  SunMedium,
  Contrast,
  Palette,
  Check,
  X,
  Undo2,
  FlipHorizontal,
  FlipVertical,
  Eraser,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedUrl: string) => void;
  onCancel: () => void;
}

interface EditState {
  rotation: number;
  scale: number;
  brightness: number;
  contrast: number;
  saturate: number;
  flipX: boolean;
  flipY: boolean;
}

const DEFAULT_STATE: EditState = {
  rotation: 0,
  scale: 1,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  flipX: false,
  flipY: false,
};

export function ImageEditor({ imageUrl, onSave, onCancel }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editState, setEditState] = useState<EditState>(DEFAULT_STATE);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [history, setHistory] = useState<EditState[]>([]);

  const pushHistory = useCallback(() => {
    setHistory((prev) => [...prev, { ...editState }]);
  }, [editState]);

  const undo = useCallback(() => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setEditState(prev);
      setHistory((h) => h.slice(0, -1));
    }
  }, [history]);

  const rotate = (degrees: number) => {
    pushHistory();
    setEditState((prev) => ({
      ...prev,
      rotation: (prev.rotation + degrees) % 360,
    }));
  };

  const zoom = (delta: number) => {
    pushHistory();
    setEditState((prev) => ({
      ...prev,
      scale: Math.max(0.25, Math.min(4, prev.scale + delta)),
    }));
  };

  const flip = (axis: "x" | "y") => {
    pushHistory();
    setEditState((prev) => ({
      ...prev,
      flipX: axis === "x" ? !prev.flipX : prev.flipX,
      flipY: axis === "y" ? !prev.flipY : prev.flipY,
    }));
  };

  const reset = () => {
    pushHistory();
    setEditState(DEFAULT_STATE);
  };

  const applyFilter = (key: keyof EditState, value: number) => {
    setEditState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.filter = `brightness(${editState.brightness}%) contrast(${editState.contrast}%) saturate(${editState.saturate}%)`;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((editState.rotation * Math.PI) / 180);
      ctx.scale(
        editState.flipX ? -editState.scale : editState.scale,
        editState.flipY ? -editState.scale : editState.scale
      );
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const editedUrl = canvas.toDataURL("image/jpeg", 0.92);
      onSave(editedUrl);
    };
    img.src = imageUrl;
  };

  const tools = [
    { id: "rotate", icon: RotateCw, label: "Rotate" },
    { id: "flip", icon: FlipHorizontal, label: "Flip" },
    { id: "zoom", icon: ZoomIn, label: "Zoom" },
    { id: "brightness", icon: SunMedium, label: "Brightness" },
    { id: "contrast", icon: Contrast, label: "Contrast" },
    { id: "saturation", icon: Palette, label: "Saturation" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col bg-black"
    >
      <div className="flex items-center justify-between bg-background px-4 py-3">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <h2 className="text-lg font-semibold">Edit Image</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={history.length === 0}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <div className="flex min-h-0 flex-1 items-center justify-center p-4">
          <div className="relative overflow-hidden rounded-lg bg-[conic-gradient(from_0deg,#ccc_0 90deg,#999_90deg_180deg,#ccc_180deg_270deg,#999_270deg)]">
            <OptimizedImage
              src={imageUrl}
              alt="Editing"
              preset="full"
              eager
              className="max-h-[70vh] max-w-full object-contain"
              style={{
                transform: `rotate(${editState.rotation}deg) scale(${editState.scale}) scaleX(${editState.flipX ? -1 : 1}) scaleY(${editState.flipY ? -1 : 1})`,
                filter: `brightness(${editState.brightness}%) contrast(${editState.contrast}%) saturate(${editState.saturate}%)`,
              }}
            />
          </div>
        </div>

        <div className="w-full overflow-y-auto border-t bg-background p-4 md:w-72 md:border-l md:border-t-0">
          <h3 className="mb-4 text-sm font-medium">Tools</h3>

          <div className="flex flex-wrap gap-1.5 sm:block sm:space-y-1">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "ghost"}
                size="sm"
                className="flex-1 justify-start sm:w-full sm:flex-none"
                onClick={() =>
                  setActiveTool(activeTool === tool.id ? null : tool.id)
                }
              >
                <tool.icon className="mr-2 h-4 w-4" />
                {tool.label}
              </Button>
            ))}
          </div>

          {activeTool === "rotate" && (
            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => rotate(-90)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Rotate Left 90°
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => rotate(90)}
              >
                <RotateCw className="mr-2 h-4 w-4" />
                Rotate Right 90°
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Current: {editState.rotation}°
              </p>
            </div>
          )}

          {activeTool === "flip" && (
            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => flip("x")}
              >
                <FlipHorizontal className="mr-2 h-4 w-4" />
                Flip Horizontal
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => flip("y")}
              >
                <FlipVertical className="mr-2 h-4 w-4" />
                Flip Vertical
              </Button>
            </div>
          )}

          {activeTool === "zoom" && (
            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => zoom(-0.25)}
              >
                <ZoomOut className="mr-2 h-4 w-4" />
                Zoom Out
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {Math.round(editState.scale * 100)}%
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => zoom(0.25)}
              >
                <ZoomIn className="mr-2 h-4 w-4" />
                Zoom In
              </Button>
            </div>
          )}

          {activeTool === "brightness" && (
            <div className="mt-4">
              <input
                type="range"
                min="0"
                max="200"
                value={editState.brightness}
                onChange={(e) =>
                  applyFilter("brightness", Number(e.target.value))
                }
                className="w-full"
              />
              <p className="mt-1 text-center text-xs text-muted-foreground">
                {editState.brightness}%
              </p>
            </div>
          )}

          {activeTool === "contrast" && (
            <div className="mt-4">
              <input
                type="range"
                min="0"
                max="200"
                value={editState.contrast}
                onChange={(e) =>
                  applyFilter("contrast", Number(e.target.value))
                }
                className="w-full"
              />
              <p className="mt-1 text-center text-xs text-muted-foreground">
                {editState.contrast}%
              </p>
            </div>
          )}

          {activeTool === "saturation" && (
            <div className="mt-4">
              <input
                type="range"
                min="0"
                max="200"
                value={editState.saturate}
                onChange={(e) =>
                  applyFilter("saturate", Number(e.target.value))
                }
                className="w-full"
              />
              <p className="mt-1 text-center text-xs text-muted-foreground">
                {editState.saturate}%
              </p>
            </div>
          )}

          <div className="mt-6">
            <Button variant="outline" size="sm" className="w-full" onClick={reset}>
              <Eraser className="mr-2 h-4 w-4" />
              Reset All
            </Button>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
