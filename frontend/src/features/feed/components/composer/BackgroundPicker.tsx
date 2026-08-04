import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, X, Check, ImageIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PostBackground {
  value: string;
  label: string;
  style: React.CSSProperties;
  textClass: string;
  defaultTextColor?: "white" | "black";
}

export const POST_BACKGROUNDS: PostBackground[] = [
  // Solid Colors
  { value: "solid-coral", label: "Coral", style: { background: "#F2715E" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "solid-peach", label: "Peach", style: { background: "#F5C3A4" }, textClass: "text-orange-900", defaultTextColor: "black" },
  { value: "solid-sand", label: "Sand", style: { background: "#E8D5B7" }, textClass: "text-amber-900", defaultTextColor: "black" },
  { value: "solid-mint", label: "Mint", style: { background: "#A8E6CF" }, textClass: "text-green-900", defaultTextColor: "black" },
  { value: "solid-sage", label: "Sage", style: { background: "#B5C99A" }, textClass: "text-green-900", defaultTextColor: "black" },
  { value: "solid-sky", label: "Sky", style: { background: "#A0D2DB" }, textClass: "text-sky-900", defaultTextColor: "black" },
  { value: "solid-lavender", label: "Lavender", style: { background: "#C3B1E1" }, textClass: "text-violet-900", defaultTextColor: "black" },
  { value: "solid-lilac", label: "Lilac", style: { background: "#D4A5D0" }, textClass: "text-purple-900", defaultTextColor: "black" },
  { value: "solid-blush", label: "Blush", style: { background: "#F2B5D4" }, textClass: "text-pink-900", defaultTextColor: "black" },
  { value: "solid-warm-gray", label: "Warm Gray", style: { background: "#AAA29D" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "solid-cool-gray", label: "Cool Gray", style: { background: "#8E9AAF" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "solid-charcoal", label: "Charcoal", style: { background: "#3D405B" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "solid-navy", label: "Navy", style: { background: "#1B2845" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "solid-black", label: "Black", style: { background: "#1A1A2E" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "solid-white", label: "White", style: { background: "#FFFFFF" }, textClass: "text-gray-900", defaultTextColor: "black" },
  { value: "solid-red", label: "Red", style: { background: "#E63946" }, textClass: "text-white", defaultTextColor: "white" },

  // Gradients
  { value: "grad-sunset", label: "Sunset", style: { background: "linear-gradient(135deg, #FF6B35, #F7C59F, #EFEFD0)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "grad-ocean", label: "Ocean", style: { background: "linear-gradient(135deg, #667EEA, #764BA2)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "grad-aurora", label: "Aurora", style: { background: "linear-gradient(135deg, #00D2FF, #3A7BD5)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "grad-forest", label: "Forest", style: { background: "linear-gradient(135deg, #11998E, #38EF7D)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "grad-peach", label: "Peach", style: { background: "linear-gradient(135deg, #FFDEE9, #B5FFFC)" }, textClass: "text-gray-800", defaultTextColor: "black" },
  { value: "grad-lavender", label: "Lavender", style: { background: "linear-gradient(135deg, #E8D5B7, #C3B1E1)" }, textClass: "text-violet-900", defaultTextColor: "black" },
  { value: "grad-candy", label: "Candy", style: { background: "linear-gradient(135deg, #FA709A, #FEE140)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "grad-midnight", label: "Midnight", style: { background: "linear-gradient(135deg, #232526, #414345)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "grad-fire", label: "Fire", style: { background: "linear-gradient(135deg, #F12711, #F5AF19)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "grad-ice", label: "Ice", style: { background: "linear-gradient(135deg, #E0EAFC, #CFDEF3)" }, textClass: "text-gray-800", defaultTextColor: "black" },
  { value: "grad-rose", label: "Rose", style: { background: "linear-gradient(135deg, #FF9A9E, #FAD0C4)" }, textClass: "text-pink-900", defaultTextColor: "black" },
  { value: "grad-cosmic", label: "Cosmic", style: { background: "linear-gradient(135deg, #0F0C29, #302B63, #24243E)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "grad-rainbow", label: "Rainbow", style: { background: "linear-gradient(135deg, #FF6B6B, #FFE66D, #4ECDC4, #556BF7, #A855F7)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "grad-blush", label: "Blush", style: { background: "linear-gradient(135deg, #FCCB90, #D57EEB)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "grad-emerald", label: "Emerald", style: { background: "linear-gradient(135deg, #3BB2B8, #2DD4BF, #5EEAD4)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "grad-sakura", label: "Sakura", style: { background: "linear-gradient(135deg, #FDCBF1, #E6B0AA)" }, textClass: "text-pink-900", defaultTextColor: "black" },
];

export const POST_BG_TEMPLATES: PostBackground[] = [
  { value: "tpl-love", label: "Love", style: { background: "linear-gradient(180deg, #FF6B6B 0%, #FF8E8E 50%, #FFB4B4 100%)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "tpl-rain", label: "Rain", style: { background: "linear-gradient(180deg, #4B6584 0%, #778CA3 50%, #A5B1C2 100%)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "tpl-sunrise", label: "Sunrise", style: { background: "linear-gradient(180deg, #2C3E50 0%, #FD746C 50%, #FF9068 100%)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "tpl-nature", label: "Nature", style: { background: "linear-gradient(180deg, #134E5E 0%, #71B280 100%)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "tpl-dream", label: "Dream", style: { background: "linear-gradient(135deg, #A8CABA 0%, #5D4157 100%)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "tpl-berry", label: "Berry", style: { background: "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)" }, textClass: "text-white", defaultTextColor: "white" },
  { value: "tpl-golden", label: "Golden", style: { background: "linear-gradient(135deg, #F7971E 0%, #FFD200 100%)" }, textClass: "text-gray-900", defaultTextColor: "black" },
  { value: "tpl-twilight", label: "Twilight", style: { background: "linear-gradient(180deg, #2C3E50 0%, #4CA1AF 100%)" }, textClass: "text-white", defaultTextColor: "white" },
];

interface BackgroundPickerProps {
  value: string;
  customColor: string | null;
  backgroundImageUrl: string | null;
  onChange: (value: string) => void;
  onCustomColorChange: (color: string | null) => void;
  onBackgroundImageChange: (url: string | null) => void;
}

type TabType = "solid" | "gradient" | "template" | "image";

export function BackgroundPicker({
  value,
  customColor,
  backgroundImageUrl,
  onChange,
  onCustomColorChange,
  onBackgroundImageChange,
}: BackgroundPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("solid");
  const [showCustom, setShowCustom] = useState(false);
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPickerPos({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        const pickerEl = document.getElementById("bg-picker-portal");
        if (pickerEl && !pickerEl.contains(target)) {
          setIsOpen(false);
          setShowCustom(false);
        }
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      onBackgroundImageChange(url);
      onChange("custom-image");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "solid", label: "Colors", icon: <Palette className="h-3.5 w-3.5" /> },
    { key: "gradient", label: "Gradients", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: "template", label: "Themes", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: "image", label: "Photo", icon: <ImageIcon className="h-3.5 w-3.5" /> },
  ];

  const solidBgs = POST_BACKGROUNDS.filter((b) => b.value.startsWith("solid-"));
  const gradientBgs = POST_BACKGROUNDS.filter((b) => b.value.startsWith("grad-"));

  const renderGrid = (items: PostBackground[]) => (
    <div className="grid grid-cols-5 gap-1.5">
      {items.map((bg) => (
        <button
          key={bg.value}
          type="button"
          onClick={() => {
            onChange(bg.value);
            onCustomColorChange(null);
            onBackgroundImageChange(null);
          }}
          title={bg.label}
          className={cn(
            "group relative h-10 w-full overflow-hidden rounded-lg border-2 transition-all duration-150 hover:scale-105",
            value === bg.value && !customColor && !backgroundImageUrl
              ? "border-white ring-2 ring-white/50"
              : "border-transparent hover:border-white/30"
          )}
          style={bg.style}
        >
          {value === bg.value && !customColor && !backgroundImageUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Check className="h-4 w-4 text-white drop-shadow" />
            </div>
          )}
          <span className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] font-medium text-white/80 drop-shadow-sm">
            {bg.label}
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => setShowCustom(!showCustom)}
        title="Custom color"
        className={cn(
          "group relative flex h-10 w-full items-center justify-center overflow-hidden rounded-lg border-2 transition-all duration-150 hover:scale-105",
          value === "custom"
            ? "border-white ring-2 ring-white/50"
            : "border-transparent hover:border-white/30 bg-white/20"
        )}
        style={customColor ? { background: customColor } : undefined}
      >
        <Palette className={cn("h-4 w-4", customColor ? "text-white drop-shadow" : "text-white/70")} />
        {value === "custom" && customColor && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Check className="h-4 w-4 text-white drop-shadow" />
          </div>
        )}
      </button>
    </div>
  );

  const renderTemplates = () => (
    <div className="grid grid-cols-4 gap-1.5">
      {POST_BG_TEMPLATES.map((bg) => (
        <button
          key={bg.value}
          type="button"
          onClick={() => {
            onChange(bg.value);
            onCustomColorChange(null);
            onBackgroundImageChange(null);
          }}
          title={bg.label}
          className={cn(
            "group relative h-14 w-full overflow-hidden rounded-lg border-2 transition-all duration-150 hover:scale-105",
            value === bg.value
              ? "border-white ring-2 ring-white/50"
              : "border-transparent hover:border-white/30"
          )}
          style={bg.style}
        >
          {value === bg.value && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Check className="h-4 w-4 text-white drop-shadow" />
            </div>
          )}
          <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] font-medium text-white/90 drop-shadow-sm">
            {bg.label}
          </span>
        </button>
      ))}
    </div>
  );

  const renderImageTab = () => (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors",
          backgroundImageUrl
            ? "border-white/50 bg-white/10"
            : "border-white/30 hover:border-white/50 hover:bg-white/5"
        )}
      >
        <ImageIcon className="h-5 w-5 text-white/70" />
        <span className="text-xs font-medium text-white/80">
          {backgroundImageUrl ? "Change image" : "Upload an image"}
        </span>
      </button>
      {backgroundImageUrl && (
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={backgroundImageUrl}
            alt="Background"
            width={320}
            height={80}
            loading="lazy"
            decoding="async"
            className="h-20 w-full object-cover"
          />
          <button
            onClick={() => {
              onBackgroundImageChange(null);
              onChange("none");
            }}
            className="absolute right-1 top-1 rounded-full bg-black/50 p-1 hover:bg-black/70"
          >
            <X className="h-3 w-3 text-white" />
          </button>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
    </div>
  );

  const pickerContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="bg-picker-portal"
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed z-[9999] w-[360px] overflow-hidden rounded-2xl border bg-gray-900 shadow-2xl"
          style={{
            bottom: `calc(100vh - ${pickerPos.top}px + 8px)`,
            left: `${pickerPos.left}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="text-sm font-semibold text-white">Post Background</span>
            <button
              onClick={() => { setIsOpen(false); setShowCustom(false); }}
              className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
                  activeTab === tab.key
                    ? "border-b-2 border-white text-white"
                    : "text-white/50 hover:text-white/80"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-h-[280px] overflow-y-auto p-3">
            <AnimatePresence mode="wait">
              {activeTab === "solid" && (
                <motion.div key="solid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {renderGrid(solidBgs)}
                  <AnimatePresence>
                    {showCustom && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 rounded-lg bg-white/10 p-2">
                          <input
                            type="color"
                            value={customColor || "#6366f1"}
                            onChange={(e) => {
                              onCustomColorChange(e.target.value);
                              onChange("custom");
                            }}
                            className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                          />
                          <div className="flex-1">
                            <div className="text-xs font-medium text-white">Custom Color</div>
                            <div className="text-[10px] text-white/50">{customColor || "#6366f1"}</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
              {activeTab === "gradient" && (
                <motion.div key="gradient" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {renderGrid(gradientBgs)}
                </motion.div>
              )}
              {activeTab === "template" && (
                <motion.div key="template" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {renderTemplates()}
                </motion.div>
              )}
              {activeTab === "image" && (
                <motion.div key="image" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {renderImageTab()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {value !== "none" && (
            <div className="border-t border-white/10 p-3">
              <button
                type="button"
                onClick={() => {
                  onChange("none");
                  onCustomColorChange(null);
                  onBackgroundImageChange(null);
                }}
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20"
              >
                Remove background
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all duration-150",
          value !== "none"
            ? "bg-white/20 text-white hover:bg-white/30"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          isOpen && "bg-white/20 text-white"
        )}
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Background</span>
      </button>
      {createPortal(pickerContent, document.body)}
    </>
  );
}

export function getPostBackgroundStyle(
  value: string,
  customColor: string | null,
  backgroundImageUrl: string | null
): { style: React.CSSProperties; textClass: string } {
  if (value === "custom-image" && backgroundImageUrl) {
    return {
      style: {
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      },
      textClass: "text-white",
    };
  }
  if (value === "custom" && customColor) {
    return { style: { background: customColor }, textClass: "text-white" };
  }
  // Handle hex/rgb color values stored directly in background_style
  if (value && (value.startsWith("#") || value.startsWith("rgb"))) {
    return { style: { background: value }, textClass: "text-white" };
  }
  const bg = [...POST_BACKGROUNDS, ...POST_BG_TEMPLATES].find((b) => b.value === value);
  if (bg && bg.value !== "none") {
    return { style: bg.style, textClass: bg.textClass };
  }
  return { style: {}, textClass: "" };
}
