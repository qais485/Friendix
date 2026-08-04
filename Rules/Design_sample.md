-------------------> Sample 1
"use client";

/**
 * @author: @dorianbaffier
 * @description: Card Flip
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { ArrowRight, Repeat2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface CardFlipProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: string[];
}

export default function CardFlip({
  title = "Design Systems",
  subtitle = "Explore the fundamentals",
  description = "Dive deep into the world of modern UI/UX design.",
  features = ["UI/UX", "Modern Design", "Tailwind CSS", "Kokonut UI"],
}: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group relative h-[320px] w-full max-w-[280px] [perspective:2000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={cn(
          "relative h-full w-full",
          "[transform-style:preserve-3d]",
          "transition-[transform] duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]",
          "motion-reduce:transition-none",
          isFlipped
            ? "[transform:rotateY(180deg)]"
            : "[transform:rotateY(0deg)]"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(0deg)]",
            "overflow-hidden rounded-2xl",
            "bg-zinc-50 dark:bg-zinc-900",
            "border border-zinc-200 dark:border-zinc-800/50",
            "shadow-xs dark:shadow-lg",
            "transition-shadow duration-500",
            "group-hover:shadow-lg dark:group-hover:shadow-xl"
          )}
        >
          <div className="relative h-full overflow-hidden bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-900 dark:to-black">
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-start justify-center pt-24"
            >
              <div className="relative flex h-[100px] w-[200px] items-center justify-center">
                {[...Array(10)].map((_, i) => (
                  <div
                    className={cn(
                      "absolute h-[50px] w-[50px]",
                      "rounded-[140px]",
                      "animate-[scale_3s_linear_infinite]",
                      "motion-reduce:animate-none",
                      "opacity-0",
                      "shadow-[0_0_50px_rgba(255,165,0,0.5)]",
                      "group-hover:animate-[scale_2s_linear_infinite]"
                    )}
                    key={i}
                    style={{
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 left-0 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5">
                <h3 className="font-semibold text-lg text-zinc-900 leading-snug tracking-tighter transition-transform duration-500 ease-out-expo group-hover:translate-y-[-4px] dark:text-white">
                  {title}
                </h3>
                <p className="line-clamp-2 text-sm text-zinc-600 tracking-tight transition-transform delay-[50ms] duration-500 ease-out-expo group-hover:translate-y-[-4px] dark:text-zinc-200">
                  {subtitle}
                </p>
              </div>
              <div className="group/icon relative">
                <div
                  className={cn(
                    "absolute inset-[-8px] rounded-lg transition-opacity duration-300",
                    "bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent"
                  )}
                />
                <Repeat2
                  aria-hidden="true"
                  className="relative z-10 h-4 w-4 text-orange-500 transition-transform duration-300 group-hover/icon:-rotate-12 group-hover/icon:scale-110"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(180deg)]",
            "rounded-2xl p-6",
            "bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-900 dark:to-black",
            "border border-zinc-200 dark:border-zinc-800",
            "shadow-xs dark:shadow-lg",
            "flex flex-col",
            "transition-shadow duration-500",
            "group-hover:shadow-lg dark:group-hover:shadow-xl"
          )}
        >
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-zinc-900 leading-snug tracking-tight transition-transform duration-500 ease-out-expo group-hover:translate-y-[-2px] dark:text-white">
                {title}
              </h3>
              <p className="line-clamp-2 text-sm text-zinc-600 tracking-tight transition-transform duration-500 ease-out-expo group-hover:translate-y-[-2px] dark:text-zinc-400">
                {description}
              </p>
            </div>

            <div className="space-y-2">
              {features.map((feature, index) => (
                <div
                  className="flex items-center gap-2 text-sm text-zinc-700 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] dark:text-zinc-300"
                  key={feature}
                  style={{
                    transform: isFlipped
                      ? "translateX(0)"
                      : "translateX(-10px)",
                    opacity: isFlipped ? 1 : 0,
                    transitionDelay: `${index * 50 + 150}ms`,
                  }}
                >
                  <ArrowRight
                    aria-hidden="true"
                    className="h-3 w-3 text-orange-500"
                  />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-zinc-200 border-t pt-6 dark:border-zinc-800">
            <button
              className={cn(
                "group/start relative w-full",
                "flex items-center justify-between",
                "-m-3 rounded-xl p-3",
                "transition-[transform,background] duration-300",
                "bg-gradient-to-r from-zinc-100 via-zinc-100 to-zinc-100",
                "dark:from-zinc-800 dark:via-zinc-800 dark:to-zinc-800",
                "hover:from-0% hover:from-orange-500/10 hover:via-100% hover:via-orange-500/5 hover:to-100% hover:to-transparent",
                "dark:hover:from-0% dark:hover:from-orange-500/20 dark:hover:via-100% dark:hover:via-orange-500/10 dark:hover:to-100% dark:hover:to-transparent",
                "hover:scale-[1.02] active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900"
              )}
              type="button"
            >
              <span className="font-medium text-sm text-zinc-900 transition-colors duration-300 group-hover/start:text-orange-600 dark:text-white dark:group-hover/start:text-orange-400">
                Start today
              </span>
              <div className="group/icon relative">
                <div
                  className={cn(
                    "absolute inset-[-6px] rounded-lg transition-[transform,opacity] duration-300",
                    "bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent",
                    "scale-90 opacity-0 group-hover/start:scale-100 group-hover/start:opacity-100"
                  )}
                />
                <ArrowRight
                  aria-hidden="true"
                  className="relative z-10 h-4 w-4 text-orange-500 transition-transform duration-300 group-hover/start:translate-x-0.5 group-hover/start:scale-110"
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
                @keyframes scale {
                    0% {
                        transform: scale(2);
                        opacity: 0;
                        box-shadow: 0px 0px 50px rgba(255, 165, 0, 0.5);
                    }
                    50% {
                        transform: translate(0px, -5px) scale(1);
                        opacity: 1;
                        box-shadow: 0px 8px 20px rgba(255, 165, 0, 0.5);
                    }
                    100% {
                        transform: translate(0px, 5px) scale(0.1);
                        opacity: 0;
                        box-shadow: 0px 10px 20px rgba(255, 165, 0, 0);
                    }
                }
            `}</style>
    </div>
  );
}





-------------------> Sample 2
"use client";

/**
 * @author: @dorianbaffier
 * @description: Card Stack
 * @version: 1.1.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Specification {
  label: string;
  value: string;
}

interface Product {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  specs: Specification[];
}

const products: Product[] = [
  {
    id: "instant-pay",
    title: "Quick Pay",
    subtitle: "Instant Transfers",
    description:
      "Move money in seconds with bank-grade security and zero surprises.",
    image: "/undraw.svg",
    specs: [
      { label: "Speed", value: "Instant" },
      { label: "Security", value: "256-bit" },
      { label: "Limit", value: "$50,000" },
      { label: "Fee", value: "0.5%" },
    ],
  },
  {
    id: "crypto-pay",
    title: "Crypto Pay",
    subtitle: "Web3 Payments",
    description:
      "Accept crypto across every major chain with optimized gas routing.",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    specs: [
      { label: "Network", value: "Multi-chain" },
      { label: "Gas", value: "Optimized" },
      { label: "Support", value: "24/7" },
      { label: "Security", value: "Top-tier" },
    ],
  },
  {
    id: "business-pay",
    title: "Business Pay",
    subtitle: "Enterprise Solutions",
    description:
      "Built for high-volume teams with custom APIs and premium support.",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
    specs: [
      { label: "Volume", value: "Unlimited" },
      { label: "API", value: "REST/SDK" },
      { label: "Support", value: "Premium" },
      { label: "Features", value: "Custom" },
    ],
  },
  {
    id: "global-pay",
    title: "Global Pay",
    subtitle: "International Transfers",
    description:
      "Send to 180+ countries with real-time FX and same-day settlement.",
    image:
      "https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800&auto=format&fit=crop&q=80",
    specs: [
      { label: "Countries", value: "180+" },
      { label: "FX Rate", value: "Real-time" },
      { label: "Speed", value: "Same-day" },
      { label: "Support", value: "Local" },
    ],
  },
];

const CARD_WIDTH = 320;
const CARD_OVERLAP = 240;

interface CardProps {
  product: Product;
  index: number;
  totalCards: number;
  isExpanded: boolean;
  reducedMotion: boolean;
}

const Card = ({
  product,
  index,
  totalCards,
  isExpanded,
  reducedMotion,
}: CardProps) => {
  const centerOffset = (totalCards - 1) * 5;
  const defaultX = index * 10 - centerOffset;
  const defaultY = index * 2;
  const defaultRotate = index * 1.5;

  const totalExpandedWidth =
    CARD_WIDTH + (totalCards - 1) * (CARD_WIDTH - CARD_OVERLAP);
  const expandedCenterOffset = totalExpandedWidth / 2;

  const spreadX =
    index * (CARD_WIDTH - CARD_OVERLAP) - expandedCenterOffset + CARD_WIDTH / 2;
  const spreadRotate = index * 5 - (totalCards - 1) * 2.5;

  const collapsedPose = {
    x: defaultX,
    y: defaultY,
    rotate: reducedMotion ? 0 : defaultRotate,
    scale: 1,
  };

  const expandedPose = {
    x: spreadX,
    y: 0,
    rotate: reducedMotion ? 0 : spreadRotate,
    scale: 1,
  };

  const isSvg = product.image.endsWith(".svg");

  return (
    <motion.div
      animate={{
        ...(isExpanded ? expandedPose : collapsedPose),
        zIndex: totalCards - index,
      }}
      className={cn(
        "absolute inset-0 w-full rounded-2xl p-6",
        "bg-white/60 dark:bg-neutral-900/60",
        "border border-white/20 dark:border-neutral-800/40",
        "backdrop-blur-xl backdrop-saturate-150",
        "shadow-[0_8px_20px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_20px_rgb(0,0,0,0.3)]",
        "hover:border-white/30 dark:hover:border-neutral-700/30",
        "hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgb(0,0,0,0.4)]",
        "transition-[border-color,box-shadow] duration-300 ease-out",
        "transform-gpu overflow-hidden"
      )}
      initial={collapsedPose}
      style={{
        maxWidth: `${CARD_WIDTH}px`,
        left: "50%",
        marginLeft: `-${CARD_WIDTH / 2}px`,
      }}
      transition={
        reducedMotion
          ? { duration: 0.2, ease: "easeOut" }
          : {
              type: "spring",
              stiffness: 220,
              damping: 28,
              mass: 1,
              delay: isExpanded ? index * 0.04 : 0,
            }
      }
    >
      <div className="relative z-10">
        <dl className="mb-4 grid grid-cols-4 justify-center gap-2">
          {product.specs.map((spec) => (
            <div
              className="flex flex-col items-start text-left text-[10px]"
              key={spec.label}
            >
              <dd className="w-full text-left font-medium text-gray-500 dark:text-gray-400">
                {spec.value}
              </dd>
              <dt className="mb-0.5 w-full text-left text-gray-900 dark:text-gray-100">
                {spec.label}
              </dt>
            </div>
          ))}
        </dl>

        <div
          className={cn(
            "relative aspect-[16/11] w-full overflow-hidden rounded-lg",
            "bg-neutral-100 dark:bg-neutral-900",
            "border border-neutral-200/50 dark:border-neutral-700/50",
            "shadow-inner"
          )}
        >
          <Image
            alt={product.description}
            className="object-cover"
            fill
            sizes="320px"
            src={product.image}
            unoptimized={isSvg}
          />
        </div>

        <div className="mt-4">
          <div className="space-y-1">
            <span className="block text-left font-bold text-3xl text-gray-900 tracking-tight dark:text-white">
              {product.title}
            </span>
            <span className="block text-left font-semibold text-3xl text-gray-500 tracking-tight dark:text-gray-400">
              {product.subtitle}
            </span>
          </div>
          <p className="mt-2 text-left text-gray-500 text-sm dark:text-gray-400">
            {product.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

interface CardStackProps {
  className?: string;
}

export default function CardStackExample({ className }: CardStackProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;

  const handleToggle = () => setIsExpanded((prev) => !prev);

  return (
    <button
      aria-expanded={isExpanded}
      aria-label={isExpanded ? "Collapse card stack" : "Expand card stack"}
      className={cn(
        "relative mx-auto cursor-pointer",
        "min-h-[440px] w-full max-w-[90vw]",
        "md:max-w-[1200px]",
        "appearance-none border-0 bg-transparent p-0",
        "mb-8 flex items-center justify-center",
        className
      )}
      onClick={handleToggle}
      type="button"
    >
      {products.map((product, index) => (
        <Card
          index={index}
          isExpanded={isExpanded}
          key={product.id}
          product={product}
          reducedMotion={reducedMotion}
          totalCards={products.length}
        />
      ))}
    </button>
  );
}




-------------------> Sample 3
"use client";

/**
 * @author: @dorianbaffier
 * @description: Liquid Glass Card - Optimized with Shadcn UI
 * @version: 2.0.0
 * @date: 2025-10-11
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { cva, type VariantProps } from "class-variance-authority";
import {
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Pause,
  Play,
} from "lucide-react";
import Image from "next/image";
import React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Constants for better maintainability
const GLASS_SHADOW_LIGHT =
  "shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)]";

const GLASS_SHADOW_DARK =
  "dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]";

const GLASS_SHADOW = `${GLASS_SHADOW_LIGHT} ${GLASS_SHADOW_DARK}`;

const DEFAULT_GLASS_FILTER_SCALE = 30;
const BUTTON_GLASS_FILTER_SCALE = 70;

// Shared glass filter component
interface GlassFilterProps {
  id: string;
  scale?: number;
}

const GlassFilter = React.memo(
  ({ id, scale = DEFAULT_GLASS_FILTER_SCALE }: GlassFilterProps) => (
    <svg aria-hidden="true" className="hidden" focusable={false}>
      <title>Glass Effect Filter</title>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          height="200%"
          id={id}
          width="200%"
          x="-50%"
          y="-50%"
        >
          <feTurbulence
            baseFrequency="0.05 0.05"
            numOctaves="1"
            result="turbulence"
            seed="1"
            type="fractalNoise"
          />
          <feGaussianBlur
            in="turbulence"
            result="blurredNoise"
            stdDeviation="2"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            result="displaced"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="B"
          />
          <feGaussianBlur in="displaced" result="finalBlur" stdDeviation="4" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
);
GlassFilter.displayName = "GlassFilter";

// Liquid Button - extends shadcn Button with glass effect
const liquidButtonVariants = cva(
  "relative transition-transform duration-200 motion-reduce:transition-none",
  {
    variants: {
      liquidVariant: {
        default:
          "active:scale-[0.97] motion-reduce:active:scale-100 motion-reduce:hover:scale-100 [@media(hover:hover)]:hover:scale-105",
        none: "",
      },
    },
    defaultVariants: {
      liquidVariant: "default",
    },
  }
);

export type LiquidButtonProps = ButtonProps &
  VariantProps<typeof liquidButtonVariants>;

function LiquidButton({
  className,
  liquidVariant = "default",
  children,
  ...props
}: LiquidButtonProps) {
  const filterId = React.useId();

  return (
    <>
      <Button
        className={cn(liquidButtonVariants({ liquidVariant }), className)}
        {...props}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit]",
            GLASS_SHADOW
          )}
        />
        <div
          className="pointer-events-none absolute inset-0 isolate -z-10 overflow-hidden rounded-[inherit]"
          style={{ backdropFilter: `url("#${filterId}")` }}
        />
        <span className="relative z-10">{children}</span>
      </Button>
      <GlassFilter id={filterId} scale={BUTTON_GLASS_FILTER_SCALE} />
    </>
  );
}

// Liquid Glass Card - extends shadcn Card with glass effect
const liquidGlassCardVariants = cva(
  "group relative overflow-hidden bg-background/20 backdrop-blur-[2px]",
  {
    variants: {
      glassSize: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      glassSize: "default",
    },
  }
);

export type LiquidGlassCardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof liquidGlassCardVariants> & {
    glassEffect?: boolean;
  };

function LiquidGlassCard({
  className,
  glassSize,
  glassEffect = true,
  children,
  ...props
}: LiquidGlassCardProps) {
  const filterId = React.useId();

  return (
    <Card
      className={cn(liquidGlassCardVariants({ glassSize }), className)}
      {...props}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit]",
          GLASS_SHADOW
        )}
      />

      {glassEffect && (
        <>
          <div
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
            style={{ backdropFilter: `url("#${filterId}")` }}
          />
          <GlassFilter id={filterId} scale={DEFAULT_GLASS_FILTER_SCALE} />
        </>
      )}

      <div className="relative z-10">{children}</div>

      <div className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] bg-gradient-to-r from-transparent via-black/5 to-transparent opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 motion-reduce:transition-none dark:via-white/5" />
    </Card>
  );
}

// Demo: Music Player Card
const TOTAL_DURATION = 45;
const VOLUME_BAR_COUNT = 8;
const SEEK_JUMP_SECONDS = 5;
const TIMER_INTERVAL_MS = 1000;
const STATIC_BAR_HEIGHT = "6px";
const MIN_TIME = 0;
const BAR_DELAY_INCREMENT = 0.1;
const PROGRESS_PERCENTAGE_MULTIPLIER = 100;

const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

interface VolumeBarsProps {
  isPlaying: boolean;
}

const VolumeBars = React.memo(({ isPlaying }: VolumeBarsProps) => {
  const bars = Array.from({ length: VOLUME_BAR_COUNT }, (_, i) => ({
    id: `bar-${i}`,
    delay: i * BAR_DELAY_INCREMENT,
  }));

  return (
    <div className="pointer-events-none flex h-8 w-10 items-end gap-0.5">
      {bars.map((bar) => (
        <div
          className={cn(
            "w-[3px] rounded-sm",
            isPlaying && "animate-bounce-music motion-reduce:animate-none"
          )}
          key={bar.id}
          style={{
            height: isPlaying ? undefined : STATIC_BAR_HEIGHT,
            animationDelay: `${bar.delay}s`,
            background: "linear-gradient(to top, #FF2E55, #FF6B88)",
          }}
        />
      ))}
    </div>
  );
});
VolumeBars.displayName = "VolumeBars";

interface ProgressBarProps {
  currentTime: number;
  totalDuration: number;
  onSeek: (newTime: number) => void;
}

const ProgressBar = React.memo(
  ({ currentTime, totalDuration, onSeek }: ProgressBarProps) => {
    const progress =
      (currentTime / totalDuration) * PROGRESS_PERCENTAGE_MULTIPLIER;

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = e.currentTarget;
      const rect = bar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      const newTime = Math.min(
        Math.max(MIN_TIME, percent * totalDuration),
        totalDuration
      );
      onSeek(newTime);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          onSeek(Math.min(currentTime + SEEK_JUMP_SECONDS, totalDuration));
          break;
        case "ArrowLeft":
          e.preventDefault();
          onSeek(Math.max(currentTime - SEEK_JUMP_SECONDS, MIN_TIME));
          break;
        case "Home":
          e.preventDefault();
          onSeek(MIN_TIME);
          break;
        case "End":
          e.preventDefault();
          onSeek(totalDuration);
          break;
        default:
          break;
      }
    };

    return (
      <>
        <div className="flex justify-between font-medium text-xs text-zinc-500 dark:text-zinc-400">
          <span className="tabular-nums">{formatTime(currentTime)}</span>
          <span className="tabular-nums">{formatTime(totalDuration)}</span>
        </div>
        <div
          aria-label="Seek progress bar"
          aria-valuemax={totalDuration}
          aria-valuemin={MIN_TIME}
          aria-valuenow={currentTime}
          aria-valuetext={`${formatTime(currentTime)} of ${formatTime(totalDuration)}`}
          className="relative z-10 h-1 w-full cursor-pointer overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="slider"
          tabIndex={0}
        >
          <div
            className="h-full bg-gradient-to-r from-[#FF2E55] to-[#FF6B88] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </>
    );
  }
);
ProgressBar.displayName = "ProgressBar";

export function NotificationCenter() {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [currentTime, setCurrentTime] = React.useState(MIN_TIME);

  React.useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentTime((prev) =>
        prev + 1 >= TOTAL_DURATION ? TOTAL_DURATION : prev + 1
      );
    }, TIMER_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isPlaying]);

  React.useEffect(() => {
    if (currentTime >= TOTAL_DURATION) {
      setIsPlaying(false);
    }
  }, [currentTime]);

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (newTime < TOTAL_DURATION && !isPlaying) {
      setIsPlaying(true);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <LiquidGlassCard className="gap-3.5 rounded-3xl border border-zinc-200/60 bg-gradient-to-br from-zinc-50 to-zinc-100 p-4 shadow-xl dark:border-zinc-700/60 dark:from-zinc-900 dark:to-black">
        <div className="flex items-center gap-3">
          <div className="relative mr-2 mb-4 h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-400 via-pink-300 to-rose-200 shadow-lg ring-1 ring-black/5 dark:shadow-xl">
            <Image
              alt="Album Art for Glow by Echo"
              className="h-full w-full object-cover"
              height={64}
              sizes="64px"
              src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/portrait2-x5MjJSaQ9ed0HZrewEhH7TkZwjZ66K.jpeg"
              width={64}
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <h3 className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-lg text-zinc-900 dark:text-white">
              Glow
            </h3>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              Echo
            </p>
          </div>

          <VolumeBars isPlaying={isPlaying} />
        </div>

        <div className="flex flex-col gap-2">
          <ProgressBar
            currentTime={currentTime}
            onSeek={handleSeek}
            totalDuration={TOTAL_DURATION}
          />

          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center justify-center gap-2">
              <LiquidButton
                aria-label="Previous track"
                className="h-10 w-10 rounded-full bg-transparent text-zinc-700 transition-colors hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
                size="icon"
                variant="ghost"
              >
                <ArrowLeft className="size-4" />
              </LiquidButton>
              <LiquidButton
                aria-label={isPlaying ? "Pause" : "Play"}
                className="h-11 w-11 rounded-full bg-transparent text-zinc-700 transition-colors hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
                onClick={handlePlayPause}
                size="icon"
                variant="ghost"
              >
                {isPlaying ? (
                  <Pause className="size-5" />
                ) : (
                  <Play className="size-5" />
                )}
              </LiquidButton>
              <LiquidButton
                aria-label="Next track"
                className="h-10 w-10 rounded-full bg-transparent text-zinc-700 transition-colors hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
                size="icon"
                variant="ghost"
              >
                <ArrowRight className="size-4" />
              </LiquidButton>
            </div>
            <LiquidButton
              aria-label="More options"
              className="h-10 w-10 rounded-full bg-transparent text-zinc-700 transition-colors hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
              size="icon"
              variant="ghost"
            >
              <MoreHorizontal className="size-4" />
            </LiquidButton>
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  );
}

export { LiquidButton, LiquidGlassCard };
export default NotificationCenter;




-------------------> Sample 4
"use client";

/**
 * @author: @kokonutui
 * @description: Apple Activity Card
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ActivityData {
  label: string;
  value: number;
  color: string;
  size: number;
  current: number;
  target: number;
  unit: string;
}

interface CircleProgressProps {
  data: ActivityData;
  index: number;
}

const activities: ActivityData[] = [
  {
    label: "MOVE",
    value: 85,
    color: "#FF2D55",
    size: 200,
    current: 479,
    target: 800,
    unit: "CAL",
  },
  {
    label: "EXERCISE",
    value: 60,
    color: "#A3F900",
    size: 160,
    current: 24,
    target: 30,
    unit: "MIN",
  },
  {
    label: "STAND",
    value: 30,
    color: "#04C7DD",
    size: 120,
    current: 6,
    target: 12,
    unit: "HR",
  },
];

const CircleProgress = ({ data, index }: CircleProgressProps) => {
  const strokeWidth = 16;
  const radius = (data.size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = ((100 - data.value) / 100) * circumference;

  const gradientId = `gradient-${data.label.toLowerCase()}`;
  const gradientUrl = `url(#${gradientId})`;

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
    >
      <div className="relative">
        <svg
          aria-label={`${data.label} Activity Progress - ${data.value}%`}
          className="-rotate-90 transform"
          height={data.size}
          viewBox={`0 0 ${data.size} ${data.size}`}
          width={data.size}
        >
          <title>{`${data.label} Activity Progress - ${data.value}%`}</title>

          <defs>
            <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="100%">
              <stop
                offset="0%"
                style={{
                  stopColor: data.color,
                  stopOpacity: 1,
                }}
              />
              <stop
                offset="100%"
                style={{
                  stopColor:
                    data.color === "#FF2D55"
                      ? "#FF6B8B"
                      : data.color === "#A3F900"
                        ? "#C5FF4D"
                        : "#4DDFED",
                  stopOpacity: 1,
                }}
              />
            </linearGradient>
          </defs>

          <circle
            className="text-zinc-200/50 dark:text-zinc-800/50"
            cx={data.size / 2}
            cy={data.size / 2}
            fill="none"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />

          <motion.circle
            animate={{ strokeDashoffset: progress }}
            cx={data.size / 2}
            cy={data.size / 2}
            fill="none"
            initial={{ strokeDashoffset: circumference }}
            r={radius}
            stroke={gradientUrl}
            strokeDasharray={circumference}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            style={{
              filter: "drop-shadow(0 0 6px rgba(0,0,0,0.15))",
            }}
            transition={{
              duration: 1.8,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>
    </motion.div>
  );
};

const DetailedActivityInfo = () => {
  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="ml-8 flex flex-col gap-6"
      initial={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {activities.map((activity) => (
        <motion.div className="flex flex-col" key={activity.label}>
          <span className="font-medium text-sm text-zinc-600 dark:text-zinc-400">
            {activity.label}
          </span>
          <span
            className="font-semibold text-2xl"
            style={{ color: activity.color }}
          >
            {activity.current}/{activity.target}
            <span className="ml-1 text-base text-zinc-600 dark:text-zinc-400">
              {activity.unit}
            </span>
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default function AppleActivityCard({
  title = "Activity Rings",
  className,
}: {
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-3xl rounded-3xl p-8",
        "text-zinc-900 dark:text-white",
        className
      )}
    >
      <div className="flex flex-col items-center gap-8">
        <motion.h2
          animate={{ opacity: 1, y: 0 }}
          className="font-medium text-2xl text-zinc-900 dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h2>

        <div className="flex items-center">
          <div className="relative h-[180px] w-[180px]">
            {activities.map((activity, index) => (
              <CircleProgress
                data={activity}
                index={index}
                key={activity.label}
              />
            ))}
          </div>
          <DetailedActivityInfo />
        </div>
      </div>
    </div>
  );
}








-------------------> Sample 5
"use client";

/**
 * @author: @dorianbaffier
 * @description: Mouse Effect Card - Interactive card with animated dot pattern that responds to mouse movement
 * @version: 1.0.0
 * @date: 2025-01-30
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SPRING_CONFIG = { stiffness: 300, damping: 30, mass: 0.5 };
const OPACITY_DURATION_BASE = 0.8;
const OPACITY_DURATION_VARIATION = 0.2;
const OPACITY_EASE = [0.4, 0, 0.2, 1] as const;
const OPACITY_DELAY_CYCLE = 1.5;
const OPACITY_DELAY_STEP = 0.02;
const MIN_OPACITY_MULTIPLIER = 0.5;
const MAX_OPACITY_MULTIPLIER = 1.5;
const MIN_OPACITY_FALLBACK = 0.3;
const PROXIMITY_MULTIPLIER = 1.2;
const PROXIMITY_OPACITY_BOOST = 0.8;

export interface MouseEffectCardProps {
  className?: string;
  children?: React.ReactNode;
  dotSize?: number;
  dotSpacing?: number;
  repulsionRadius?: number;
  repulsionStrength?: number;
  title?: string;
  subtitle?: string;
  topText?: string;
  topSubtext?: string;
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  footerText?: string;
  ariaLabel?: string;
}

interface Dot {
  id: string;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  opacity: number;
}

interface DotComponentProps {
  dot: Dot;
  index: number;
  dotSize: number;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
  repulsionRadius: number;
  repulsionStrength: number;
}

function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

function generateDots(width: number, height: number, spacing: number): Dot[] {
  const dots: Dot[] = [];
  const cols = Math.ceil(width / spacing);
  const rows = Math.ceil(height / spacing);
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const x = col * spacing;
      const y = row * spacing;

      // Calculate distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

      // Calculate edge factor (0 at edges, 1 at center)
      const edgeFactor = Math.min(distanceFromCenter / (maxDistance * 0.7), 1);

      // Skip dots near edges with probability based on distance
      if (Math.random() > edgeFactor) {
        continue;
      }

      const pattern = (row + col) % 3;
      const baseOpacities = [0.3, 0.5, 0.7];
      const opacity = baseOpacities[pattern] * edgeFactor;

      dots.push({
        id: `dot-${row}-${col}`,
        x,
        y,
        baseX: x,
        baseY: y,
        opacity,
      });
    }
  }

  return dots;
}

function DotComponent({
  dot,
  index,
  dotSize,
  mouseX,
  mouseY,
  repulsionRadius,
  repulsionStrength,
}: DotComponentProps) {
  const posX = useTransform([mouseX, mouseY], () => {
    const mx = mouseX.get();
    const my = mouseY.get();

    if (!(Number.isFinite(mx) && Number.isFinite(my))) {
      return 0;
    }

    const dx = dot.baseX - mx;
    const dy = dot.baseY - my;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < repulsionRadius) {
      const force = (1 - distance / repulsionRadius) * repulsionStrength;
      const angle = Math.atan2(dy, dx);
      return Math.cos(angle) * force;
    }

    return 0;
  });

  const posY = useTransform([mouseX, mouseY], () => {
    const mx = mouseX.get();
    const my = mouseY.get();

    if (!(Number.isFinite(mx) && Number.isFinite(my))) {
      return 0;
    }

    const dx = dot.baseX - mx;
    const dy = dot.baseY - my;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < repulsionRadius) {
      const force = (1 - distance / repulsionRadius) * repulsionStrength;
      const angle = Math.atan2(dy, dx);
      return Math.sin(angle) * force;
    }

    return 0;
  });

  const opacityBoost = useTransform([mouseX, mouseY], () => {
    const mx = mouseX.get();
    const my = mouseY.get();

    if (!(Number.isFinite(mx) && Number.isFinite(my))) return 0;

    const distance = calculateDistance(dot.baseX, dot.baseY, mx, my);
    const maxDistance = repulsionRadius * PROXIMITY_MULTIPLIER;

    if (distance < maxDistance) {
      const proximityFactor = 1 - distance / maxDistance;
      return proximityFactor * PROXIMITY_OPACITY_BOOST;
    }

    return 0;
  });

  const x = useSpring(posX, SPRING_CONFIG);
  const y = useSpring(posY, SPRING_CONFIG);

  const baseMinOpacity = Math.max(
    dot.opacity * MIN_OPACITY_MULTIPLIER,
    MIN_OPACITY_FALLBACK
  );
  const baseMaxOpacity = Math.min(dot.opacity * MAX_OPACITY_MULTIPLIER, 1);

  const minOpacityWithBoost = useTransform(opacityBoost, (boost) =>
    Math.min(baseMinOpacity + boost, 1)
  );

  const delay = (index * OPACITY_DELAY_STEP) % OPACITY_DELAY_CYCLE;

  return (
    <motion.div
      animate={{
        opacity: [baseMinOpacity, baseMaxOpacity, baseMinOpacity],
      }}
      className="absolute rounded-full bg-zinc-400 will-change-transform dark:bg-zinc-600"
      initial={{ opacity: baseMinOpacity }}
      style={{
        width: dotSize,
        height: dotSize,
        left: dot.baseX,
        top: dot.baseY,
        x,
        y,
        opacity: useSpring(minOpacityWithBoost, {
          stiffness: 150,
          damping: 25,
        }),
      }}
      transition={{
        opacity: {
          duration:
            OPACITY_DURATION_BASE + (index % 4) * OPACITY_DURATION_VARIATION,
          repeat: Number.POSITIVE_INFINITY,
          ease: OPACITY_EASE,
          delay,
          times: [0, 0.5, 1],
        },
      }}
    />
  );
}

export default function MouseEffectCard({
  className,
  children,
  dotSize = 2,
  dotSpacing = 16,
  repulsionRadius = 80,
  repulsionStrength = 20,
  title = "Acme",
  subtitle = "Build interfaces with interactive patterns",
  topText = "Case Study",
  topSubtext = "Discover something new",
  primaryCtaText = "Get Started",
  primaryCtaUrl = "#",
  secondaryCtaText = "View Docs",
  secondaryCtaUrl = "#",
  footerText = "We do it all",
  ariaLabel,
}: MouseEffectCardProps) {
  const innerContainerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const mouseY = useMotionValue(Number.POSITIVE_INFINITY);
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    const updateDots = () => {
      if (!innerContainerRef.current) return;
      const rect = innerContainerRef.current.getBoundingClientRect();
      const newDots = generateDots(rect.width, rect.height, dotSpacing);
      setDots(newDots);
    };

    updateDots();

    const resizeObserver = new ResizeObserver(updateDots);
    if (innerContainerRef.current) {
      resizeObserver.observe(innerContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [dotSpacing]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!innerContainerRef.current) return;

    const rect = innerContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(Number.POSITIVE_INFINITY);
    mouseY.set(Number.POSITIVE_INFINITY);
  };

  const handleFocus = () => {
    if (!innerContainerRef.current) return;
    const rect = innerContainerRef.current.getBoundingClientRect();
    mouseX.set(rect.width / 2);
    mouseY.set(rect.height / 2);
  };

  const handleBlur = () => {
    mouseX.set(Number.POSITIVE_INFINITY);
    mouseY.set(Number.POSITIVE_INFINITY);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!innerContainerRef.current) return;
    const rect = innerContainerRef.current.getBoundingClientRect();
    const step = Math.min(rect.width, rect.height) * 0.2;
    const currentX = Number.isFinite(mouseX.get())
      ? mouseX.get()
      : rect.width / 2;
    const currentY = Number.isFinite(mouseY.get())
      ? mouseY.get()
      : rect.height / 2;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        mouseY.set(Math.max(0, currentY - step));
        mouseX.set(currentX);
        break;
      case "ArrowDown":
        e.preventDefault();
        mouseY.set(Math.min(rect.height, currentY + step));
        mouseX.set(currentX);
        break;
      case "ArrowLeft":
        e.preventDefault();
        mouseX.set(Math.max(0, currentX - step));
        mouseY.set(currentY);
        break;
      case "ArrowRight":
        e.preventDefault();
        mouseX.set(Math.min(rect.width, currentX + step));
        mouseY.set(currentY);
        break;
    }
  };

  return (
    <Card
      className={cn(
        "relative w-full max-w-md overflow-hidden rounded-2xl border border-white/40 p-0 shadow-none dark:border-white/10",
        className
      )}
    >
      <CardContent
        aria-label={ariaLabel ?? `${title} — ${subtitle}`}
        className="relative h-[400px] w-full overflow-hidden p-0"
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        ref={innerContainerRef}
        tabIndex={0}
      >
        {dots.map((dot, index) => (
          <DotComponent
            dot={dot}
            dotSize={dotSize}
            index={index}
            key={dot.id}
            mouseX={mouseX}
            mouseY={mouseY}
            repulsionRadius={repulsionRadius}
            repulsionStrength={repulsionStrength}
          />
        ))}

        {topText && (
          <div className="absolute top-6 left-6 z-10">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-white/60 blur-lg dark:bg-zinc-950/60" />
              <div className="relative flex flex-col gap-1">
                <p className="font-bold text-sm text-zinc-900 dark:text-white">
                  {topText}
                </p>
                {topSubtext && (
                  <p className="font-medium text-xs text-zinc-600 opacity-70 dark:text-zinc-400">
                    {topSubtext}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-2">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/80 blur-2xl dark:bg-zinc-950/80" />
              <h2 className="relative text-center font-bold text-4xl text-zinc-900 tracking-tight dark:text-white">
                {title}
              </h2>
            </div>
            {(subtitle || children) && (
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-white/60 blur-xl dark:bg-zinc-950/60" />
                <p className="relative max-w-sm text-center font-medium text-base text-zinc-700 leading-relaxed dark:text-zinc-300">
                  {children || subtitle}
                </p>
              </div>
            )}
            <div className="mt-2 flex items-center gap-3">
              <Button asChild className="rounded-full shadow-lg" size="lg">
                <a
                  href={primaryCtaUrl}
                  onClick={(e) => {
                    if (primaryCtaUrl === "#") {
                      e.preventDefault();
                    }
                  }}
                >
                  {primaryCtaText}
                </a>
              </Button>
              {secondaryCtaText && (
                <Button
                  asChild
                  className="rounded-full"
                  size="lg"
                  variant="outline"
                >
                  <a
                    href={secondaryCtaUrl}
                    onClick={(e) => {
                      if (secondaryCtaUrl === "#") {
                        e.preventDefault();
                      }
                    }}
                  >
                    {secondaryCtaText}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {footerText && (
          <div className="absolute right-0 bottom-6 left-0 z-10 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/60 blur-lg dark:bg-zinc-950/60" />
              <p className="relative px-4 py-1 font-medium text-xs text-zinc-600 dark:text-zinc-400">
                {footerText}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}





-------------------> Sample 6
import { VerifiedIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @author: @dorianbaffier
 * @description: Tweet Card
 * @version: 1.0.0
 * @date: 2025-10-01
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

type ReplyProps = {
  authorName: string;
  authorHandle: string;
  authorImage: string;
  content: string;
  isVerified?: boolean;
  timestamp: string;
};

type TweetCardProps = {
  authorName?: string;
  authorHandle?: string;
  authorImage?: string;
  content?: string[];
  isVerified?: boolean;
  timestamp?: string;
  href?: string;
  reply?: ReplyProps;
  className?: string;
};

export default function TweetCard({
  authorName = "Dorian",
  authorHandle = "dorianbaffier",
  authorImage = "https://pbs.twimg.com/profile_images/1992215290936205312/N_EuwLUO_400x400.jpg",
  content = [
    "All components from KokonutUI can now be open in @v0 🎉",
    "1. Click on 'Open in V0'",
    "2. Customize with prompts",
    "3. Deploy to your app",
  ],
  isVerified = true,
  timestamp = "Jan 18, 2025",
  href = "#",
  reply = {
    authorName: "shadcn",
    authorHandle: "shadcn",
    authorImage:
      "https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_400x400.jpg",
    content: "Awesome.",
    isVerified: true,
    timestamp: "Jan 18",
  },
  className,
}: TweetCardProps) {
  return (
    <Link href={href} target="_blank">
      <div
        className={cn(
          "relative isolate w-full min-w-[400px] max-w-xl overflow-hidden rounded-2xl p-1.5 md:min-w-[500px]",
          "bg-white/5 dark:bg-black/90",
          "bg-linear-to-br from-black/5 to-black/[0.02] dark:from-white/5 dark:to-white/[0.02]",
          "backdrop-blur-xl backdrop-saturate-[180%]",
          "border border-black/10 dark:border-white/10",
          "shadow-[0_8px_16px_rgb(0_0_0_/_0.15)] dark:shadow-[0_8px_16px_rgb(0_0_0_/_0.25)]",
          "translate-z-0 will-change-transform"
        )}
      >
        <div
          className={cn(
            "relative w-full rounded-xl p-5",
            "bg-linear-to-br from-black/[0.05] to-transparent dark:from-white/[0.08] dark:to-transparent",
            "backdrop-blur-md backdrop-saturate-150",
            "border border-black/[0.05] dark:border-white/[0.08]",
            "text-black/90 dark:text-white",
            "shadow-xs",
            "translate-z-0 will-change-transform",
            "before:pointer-events-none before:absolute before:inset-0 before:bg-linear-to-br before:from-black/[0.02] before:to-black/[0.01] before:opacity-0 before:transition-opacity dark:before:from-white/[0.03] dark:before:to-white/[0.01]",
            "hover:before:opacity-100"
          )}
        >
          <div className="flex gap-3">
            <div className="shrink-0">
              <div className="h-10 w-10 overflow-hidden rounded-full">
                <img
                  alt={authorName}
                  className="h-full w-full object-cover"
                  src={authorImage}
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="cursor-pointer font-semibold text-black hover:underline dark:text-white/90">
                      {authorName}
                    </span>
                    {isVerified && (
                      <VerifiedIcon className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                  <span className="text-black text-sm dark:text-white/60">
                    @{authorHandle}
                  </span>
                </div>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg p-1 text-black hover:bg-black/5 hover:text-black dark:text-white/80 dark:hover:bg-white/5 dark:hover:text-white"
                  type="button"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    height="1227"
                    viewBox="0 0 1200 1227"
                    width="1200"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>X</title>
                    <path
                      d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2">
            {content.map((item, index) => (
              <p
                className="text-base text-black dark:text-white/90"
                key={index}
              >
                {item}
              </p>
            ))}
            <span className="mt-2 block text-black text-sm dark:text-white/50">
              {timestamp}
            </span>
          </div>

          {reply && (
            <div className="mt-4 border-black/[0.08] border-t pt-4 dark:border-white/[0.08]">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="h-10 w-10 overflow-hidden rounded-full">
                    <img
                      alt={reply.authorName}
                      className="h-full w-full object-cover"
                      src={reply.authorImage}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="cursor-pointer font-semibold text-black hover:underline dark:text-white/90">
                      {reply.authorName}
                    </span>
                    {reply.isVerified && (
                      <VerifiedIcon className="h-4 w-4 text-blue-400" />
                    )}
                    <span className="text-black text-sm dark:text-white/60">
                      @{reply.authorHandle}
                    </span>
                    <span className="text-black text-sm dark:text-white/60">
                      ·
                    </span>
                    <span className="text-black text-sm dark:text-white/60">
                      {reply.timestamp}
                    </span>
                  </div>
                  <p className="mt-1 text-black text-sm dark:text-white/80">
                    {reply.content}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}






-------------------> Sample 7
"use client";

/**
 * @author dorianbaffier
 * @description Feature grid with aurora ambient, magnetic 3D tilt, and focus-dim siblings.
 * @version 2.0.0
 * @date 2025-02-20
 * @license MIT
 * @website https://kokonutui.com
 * @github https://github.com/kokonut-labs/kokonutui
 */

import type { LucideIcon } from "lucide-react";
import { Cloud, Code, Cpu, Globe, Lock, Zap } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Constants ──────────────────────────────────────────────────────────────────

const TILT_MAX = 9;
const TILT_SPRING = { stiffness: 300, damping: 28 } as const;
const GLOW_SPRING = { stiffness: 180, damping: 22 } as const;

// ─── Data ────────────────────────────────────────────────────────────────────────

export interface SpotlightItem {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const DEFAULT_ITEMS: SpotlightItem[] = [
  {
    icon: Zap,
    title: "Instant",
    description:
      "Sub-100ms latency on every request, globally distributed across every region.",
    color: "#f59e0b",
  },
  {
    icon: Lock,
    title: "Secure",
    description:
      "Zero-trust by default. SOC 2 certified with end-to-end encryption throughout.",
    color: "#60a5fa",
  },
  {
    icon: Globe,
    title: "Global",
    description:
      "Edge-deployed to 300+ locations. Your users always hit a nearby server.",
    color: "#34d399",
  },
  {
    icon: Code,
    title: "Developer first",
    description:
      "Type-safe SDKs in five languages, a complete REST API, and honest docs.",
    color: "#a78bfa",
  },
  {
    icon: Cpu,
    title: "Scalable",
    description:
      "From side project to Series B without touching your infrastructure config.",
    color: "#38bdf8",
  },
  {
    icon: Cloud,
    title: "Serverless",
    description:
      "No servers to provision, patch, or babysit. Just deploy and move on.",
    color: "#f472b6",
  },
];

// ─── Card ────────────────────────────────────────────────────────────────────────

interface CardProps {
  item: SpotlightItem;
  dimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

function Card({ item, dimmed, onHoverStart, onHoverEnd }: CardProps) {
  const Icon = item.icon;
  const cardRef = useRef<HTMLDivElement>(null);

  const normX = useMotionValue(0.5);
  const normY = useMotionValue(0.5);

  const rawRotateX = useTransform(normY, [0, 1], [TILT_MAX, -TILT_MAX]);
  const rawRotateY = useTransform(normX, [0, 1], [-TILT_MAX, TILT_MAX]);

  const rotateX = useSpring(rawRotateX, TILT_SPRING);
  const rotateY = useSpring(rawRotateY, TILT_SPRING);
  const glowOpacity = useSpring(0, GLOW_SPRING);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    normX.set((e.clientX - rect.left) / rect.width);
    normY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseEnter = () => {
    glowOpacity.set(1);
    onHoverStart();
  };

  const handleMouseLeave = () => {
    normX.set(0.5);
    normY.set(0.5);
    glowOpacity.set(0);
    onHoverEnd();
  };

  return (
    <motion.div
      animate={{
        scale: dimmed ? 0.96 : 1,
        opacity: dimmed ? 0.5 : 1,
      }}
      className={cn(
        "group relative flex flex-col gap-5 overflow-hidden rounded-2xl border p-6",
        // Light
        "border-zinc-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        // Dark
        "dark:border-white/6 dark:bg-white/3 dark:shadow-none",
        "transition-[border-color] duration-300",
        "hover:border-zinc-300 dark:hover:border-white/14"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={cardRef}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
      }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {/* Static accent tint — always visible */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at 20% 20%, ${item.color}14, transparent 65%)`,
        }}
      />

      {/* Hover glow layer */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          opacity: glowOpacity,
          background: `radial-gradient(ellipse at 20% 20%, ${item.color}2e, transparent 65%)`,
        }}
      />

      {/* Shimmer sweep */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[55%] -translate-x-full -skew-x-12 bg-linear-to-r from-transparent via-white/4.5 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[280%]"
      />

      {/* Icon badge */}
      <div
        className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          background: `${item.color}18`,
          boxShadow: `inset 0 0 0 1px ${item.color}30`,
        }}
      >
        <Icon size={17} strokeWidth={1.9} style={{ color: item.color }} />
      </div>

      {/* Text */}
      <div className="relative z-10 flex flex-col gap-2">
        <h3 className="font-semibold text-[14px] text-zinc-900 tracking-tight dark:text-white">
          {item.title}
        </h3>
        <p className="text-[12.5px] text-zinc-500 leading-relaxed dark:text-white/40">
          {item.description}
        </p>
      </div>

      {/* Accent bottom line */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full transition-all duration-500 group-hover:w-full"
        style={{
          background: `linear-gradient(to right, ${item.color}80, transparent)`,
        }}
      />
    </motion.div>
  );
}

Card.displayName = "Card";

// ─── Main export ──────────────────────────────────────────────────────────────────

export interface SpotlightCardsProps {
  items?: SpotlightItem[];
  eyebrow?: string;
  heading?: string;
  className?: string;
}

export default function SpotlightCards({
  items = DEFAULT_ITEMS,
  eyebrow = "Features",
  heading = "Everything you need",
  className,
}: SpotlightCardsProps) {
  const [hoveredTitle, setHoveredTitle] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl px-8 pt-9 pb-10",
        "bg-white dark:bg-[#06060f]",
        className
      )}
    >
      {/* Dot grid — light mode only */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.055) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Header */}
      <div className="relative mb-8 flex flex-col gap-1.5">
        <p className="font-semibold text-[10px] text-indigo-600 uppercase tracking-[0.22em] dark:text-indigo-400/80">
          {eyebrow}
        </p>
        <h2 className="font-semibold text-[22px] text-zinc-900 tracking-tight dark:text-white">
          {heading}
        </h2>
      </div>

      {/* Card grid */}
      <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <Card
            dimmed={hoveredTitle !== null && hoveredTitle !== item.title}
            item={item}
            key={item.title}
            onHoverEnd={() => setHoveredTitle(null)}
            onHoverStart={() => setHoveredTitle(item.title)}
          />
        ))}
      </div>
    </div>
  );
}







-------------------> Sample 7
"use client";

/**
 * @author: @dorianbaffier
 * @description: Currency Transfer
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import {
  ArrowDownIcon,
  ArrowUpDown,
  ArrowUpIcon,
  Check,
  InfoIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CheckmarkProps {
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        delay: i * 0.2,
        type: "spring",
        duration: 1.5,
        bounce: 0.2,
        ease: [0.22, 1, 0.36, 1],
      },
      opacity: { delay: i * 0.2, duration: 0.3 },
    },
  }),
};

export function Checkmark({
  size = 100,
  strokeWidth = 2,
  color = "currentColor",
  className = "",
}: CheckmarkProps) {
  return (
    <motion.svg
      animate="visible"
      className={className}
      height={size}
      initial="hidden"
      viewBox="0 0 100 100"
      width={size}
    >
      <title>Animated Checkmark</title>
      <motion.circle
        custom={0}
        cx="50"
        cy="50"
        r="42"
        stroke={color}
        style={{
          strokeWidth,
          strokeLinecap: "round",
          fill: "transparent",
          filter: "drop-shadow(0 0 2px rgba(16, 185, 129, 0.2))",
        }}
        variants={draw as any}
      />
      <motion.path
        custom={1}
        d="M32 50L45 63L68 35"
        stroke={color}
        style={{
          strokeWidth: strokeWidth + 0.5,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          fill: "transparent",
          filter: "drop-shadow(0 0 1px rgba(16, 185, 129, 0.3))",
        }}
        variants={draw as any}
      />
    </motion.svg>
  );
}

export default function CurrencyTransfer() {
  const [isCompleted, setIsCompleted] = useState(false);
  const transactionId = "TXN-DAB3UL494";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCompleted(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <TooltipProvider>
      <Card className="mx-auto flex h-[420px] w-full max-w-sm flex-col border border-zinc-200/60 bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] backdrop-blur-sm transition-all duration-500 hover:border-emerald-500/20 dark:border-zinc-800/60 dark:bg-zinc-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03)] dark:hover:border-emerald-500/20">
        <CardContent className="flex flex-1 flex-col justify-center space-y-4">
          <div className="flex h-[80px] items-center justify-center">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
              initial={{ opacity: 0, y: -10 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="relative flex h-[100px] w-[100px] items-center justify-center">
                <motion.div
                  animate={{
                    opacity: [0, 1, 0.8],
                  }}
                  className="absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl dark:bg-emerald-500/5"
                  initial={{ opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    times: [0, 0.5, 1],
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      animate={{
                        opacity: 1,
                        rotate: 0,
                      }}
                      className="flex h-[100px] w-[100px] items-center justify-center"
                      initial={{
                        opacity: 0,
                        rotate: -180,
                      }}
                      key="completed"
                      transition={{
                        duration: 0.6,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="relative z-10 rounded-full border border-emerald-500 bg-white p-5 dark:bg-zinc-900">
                        <Check
                          className="h-10 w-10 text-emerald-500"
                          strokeWidth={3.5}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ opacity: 1 }}
                      className="flex h-[100px] w-[100px] items-center justify-center"
                      exit={{
                        opacity: 0,
                        rotate: 360,
                      }}
                      initial={{ opacity: 0 }}
                      key="progress"
                      transition={{
                        duration: 0.6,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="relative z-10">
                        <motion.div
                          animate={{
                            rotate: 360,
                            scale: [1, 1.02, 1],
                          }}
                          className="absolute inset-0 rounded-full border-2 border-transparent"
                          style={{
                            borderLeftColor: "rgb(16 185 129)",
                            borderTopColor: "rgb(16 185 129 / 0.2)",
                            filter: "blur(0.5px)",
                          }}
                          transition={{
                            rotate: {
                              duration: 3,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "linear",
                            },
                            scale: {
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                            },
                          }}
                        />
                        <div className="relative z-10 rounded-full bg-white p-5 shadow-[0_0_15px_rgba(16,185,129,0.1)] dark:bg-zinc-900">
                          <ArrowUpDown className="h-10 w-10 text-emerald-500" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
          <div className="flex h-[280px] flex-col">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 w-full space-y-2 text-center"
              initial={{ opacity: 0, y: 10 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <AnimatePresence mode="wait">
                {isCompleted ? (
                  <motion.h2
                    animate={{ opacity: 1, y: 0 }}
                    className="font-semibold text-lg text-zinc-900 uppercase tracking-tighter dark:text-zinc-100"
                    exit={{ opacity: 0, y: -20 }}
                    initial={{ opacity: 0, y: 20 }}
                    key="completed-title"
                    transition={{
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    Transfer Completed
                  </motion.h2>
                ) : (
                  <motion.h2
                    animate={{ opacity: 1, y: 0 }}
                    className="font-semibold text-lg text-zinc-900 uppercase tracking-tighter dark:text-zinc-100"
                    exit={{ opacity: 0, y: -20 }}
                    initial={{ opacity: 0, y: 20 }}
                    key="progress-title"
                    transition={{
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    Transfer in Progress
                  </motion.h2>
                )}
              </AnimatePresence>
              <AnimatePresence mode="wait">
                {isCompleted ? (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="font-medium text-emerald-600 text-xs dark:text-emerald-400"
                    exit={{ opacity: 0, y: -10 }}
                    initial={{ opacity: 0, y: 10 }}
                    key="completed-id"
                    transition={{
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    Transaction ID: {transactionId}
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="font-medium text-emerald-600 text-xs dark:text-emerald-400"
                    exit={{ opacity: 0, y: -10 }}
                    initial={{ opacity: 0, y: 10 }}
                    key="progress-status"
                    transition={{
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    Processing Transaction...
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mt-4 flex items-center gap-4">
                <motion.div
                  animate={{ opacity: 1 }}
                  className="relative flex-1"
                  initial={{ opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <motion.div
                    animate={{
                      gap: isCompleted ? "0px" : "12px",
                    }}
                    className="relative flex flex-col items-start"
                    initial={{ gap: "12px" }}
                    transition={{
                      duration: 0.6,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                  >
                    <motion.div
                      animate={{
                        y: 0,
                        scale: 1,
                      }}
                      className={cn(
                        "w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 backdrop-blur-md transition-all duration-300 dark:border-zinc-700/50 dark:bg-zinc-800/50",
                        isCompleted
                          ? "rounded-b-none border-b-0"
                          : "hover:border-emerald-500/30"
                      )}
                      transition={{
                        duration: 0.6,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                    >
                      <div className="w-full space-y-1">
                        <motion.span
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-1.5 font-medium text-xs text-zinc-500 dark:text-zinc-400"
                          initial={{ opacity: 1 }}
                          transition={{
                            duration: 0.3,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          <ArrowUpIcon className="h-3 w-3" />
                          From
                        </motion.span>
                        <div className="flex flex-col gap-1.5">
                          <motion.div
                            animate={{ opacity: 1 }}
                            className="group flex items-center gap-2.5"
                            initial={{ opacity: 1 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            <motion.span
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-300 bg-white font-medium text-sm text-zinc-900 shadow-lg transition-colors duration-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 10,
                              }}
                              whileHover={{
                                scale: 1.05,
                              }}
                            >
                              $
                            </motion.span>
                            <div className="flex flex-col items-start">
                              <AnimatePresence mode="wait">
                                <motion.span
                                  animate={{
                                    opacity: isCompleted ? 1 : 0.5,
                                  }}
                                  className={cn(
                                    "font-medium text-zinc-900 tracking-tight dark:text-zinc-100"
                                  )}
                                  exit={{
                                    opacity: isCompleted ? 1 : 0.5,
                                  }}
                                  initial={{
                                    opacity: isCompleted ? 1 : 0.5,
                                  }}
                                  key={
                                    isCompleted
                                      ? "completed-amount"
                                      : "processing-amount"
                                  }
                                  transition={{
                                    duration: 0.3,
                                    ease: [0.22, 1, 0.36, 1],
                                  }}
                                >
                                  500.00 USD
                                </motion.span>
                              </AnimatePresence>
                              <motion.span
                                animate={{
                                  opacity: 1,
                                }}
                                className="text-xs text-zinc-500 dark:text-zinc-400"
                                initial={{
                                  opacity: 1,
                                }}
                                transition={{
                                  duration: 0.3,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                              >
                                Chase Bank ••••4589
                              </motion.span>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      animate={{
                        y: 0,
                        scale: 1,
                      }}
                      className={cn(
                        "w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 backdrop-blur-md transition-all duration-300 dark:border-zinc-700/50 dark:bg-zinc-800/50",
                        isCompleted
                          ? "rounded-t-none border-t-0"
                          : "hover:border-emerald-500/30"
                      )}
                      transition={{
                        duration: 0.6,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                    >
                      <div className="w-full space-y-1">
                        <motion.span
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-1.5 font-medium text-xs text-zinc-500 dark:text-zinc-400"
                          initial={{ opacity: 1 }}
                          transition={{
                            duration: 0.3,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          <ArrowDownIcon className="h-3 w-3" />
                          To
                        </motion.span>
                        <div className="flex flex-col gap-1.5">
                          <motion.div
                            animate={{ opacity: 1 }}
                            className="group flex items-center gap-2.5"
                            initial={{ opacity: 1 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            <motion.span
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-300 bg-white font-medium text-sm text-zinc-900 shadow-lg transition-colors duration-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 10,
                              }}
                              whileHover={{
                                scale: 1.05,
                              }}
                            >
                              €
                            </motion.span>
                            <div className="flex flex-col items-start">
                              <AnimatePresence mode="wait">
                                <motion.span
                                  animate={{
                                    opacity: isCompleted ? 1 : 0.5,
                                  }}
                                  className={cn(
                                    "font-medium text-zinc-900 tracking-tight dark:text-zinc-100"
                                  )}
                                  exit={{
                                    opacity: isCompleted ? 1 : 0.5,
                                  }}
                                  initial={{
                                    opacity: isCompleted ? 1 : 0.5,
                                  }}
                                  key={
                                    isCompleted
                                      ? "completed-amount-eur"
                                      : "processing-amount-eur"
                                  }
                                  transition={{
                                    duration: 0.3,
                                    ease: [0.22, 1, 0.36, 1],
                                  }}
                                >
                                  460.00 EUR
                                </motion.span>
                              </AnimatePresence>
                              <motion.span
                                animate={{
                                  opacity: 1,
                                }}
                                className="text-xs text-zinc-500 dark:text-zinc-400"
                                initial={{
                                  opacity: 1,
                                }}
                                transition={{
                                  duration: 0.3,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                              >
                                Deutsche Bank ••••7823
                              </motion.span>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
              <motion.div
                animate={{ opacity: 1 }}
                className="mt-2 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400"
                initial={{ opacity: 0 }}
                transition={{
                  delay: 0.5,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.span
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      initial={{ opacity: 0, y: 10 }}
                      key="completed-rate"
                      transition={{
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      Exchange Rate: 1 USD = 0.92 EUR
                    </motion.span>
                  ) : (
                    <motion.span
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      initial={{ opacity: 0, y: 10 }}
                      key="calculating-rate"
                      transition={{
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      Calculating exchange rate...
                    </motion.span>
                  )}
                </AnimatePresence>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-3 w-3 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {isCompleted
                        ? "Rate updated at 10:45 AM"
                        : "Please wait..."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}







-------------------> Sample 8
"use client";

/**
 * @author: @dorianbaffier
 * @description: Toolbar
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import {
  Bell,
  CircleUserRound,
  Edit2,
  FileDown,
  Frame,
  Layers,
  Lock,
  type LucideIcon,
  MousePointer2,
  Move,
  Palette,
  Shapes,
  Share2,
  SlidersHorizontal,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ToolbarItem {
  id: string;
  title: string;
  icon: LucideIcon;
  type?: never;
}

interface ToolbarProps {
  items?: ToolbarItem[];
  defaultSelected?: string;
  className?: string;
  activeColor?: string;
  onSelect?: (itemId: string) => void;
}

const DEFAULT_TOOLBAR_ITEMS: ToolbarItem[] = [
  { id: "select", title: "Select", icon: MousePointer2 },
  { id: "move", title: "Move", icon: Move },
  { id: "shapes", title: "Shapes", icon: Shapes },
  { id: "layers", title: "Layers", icon: Layers },
  { id: "frame", title: "Frame", icon: Frame },
  { id: "properties", title: "Properties", icon: SlidersHorizontal },
  { id: "export", title: "Export", icon: FileDown },
  { id: "share", title: "Share", icon: Share2 },
  { id: "notifications", title: "Notifications", icon: Bell },
  { id: "profile", title: "Profile", icon: CircleUserRound },
  { id: "appearance", title: "Appearance", icon: Palette },
];

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const notificationVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: -10 },
  exit: { opacity: 0, y: -20 },
};

const lineVariants = {
  initial: { scaleX: 0, x: "-50%" },
  animate: {
    scaleX: 1,
    x: "0%",
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    scaleX: 0,
    x: "50%",
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const transition = { type: "spring", bounce: 0, duration: 0.4 };

export function Toolbar({
  items = DEFAULT_TOOLBAR_ITEMS,
  defaultSelected = "select",
  className,
  activeColor = "text-primary",
  onSelect,
}: ToolbarProps) {
  const [selected, setSelected] = React.useState<string | null>(
    defaultSelected
  );
  const [isToggled, setIsToggled] = React.useState(false);
  const [activeNotification, setActiveNotification] = React.useState<
    string | null
  >(null);
  const outsideClickRef = React.useRef(null);

  const handleItemClick = (itemId: string) => {
    setSelected(selected === itemId ? null : itemId);
    onSelect?.(itemId);
    setActiveNotification(itemId);
    setTimeout(() => setActiveNotification(null), 1500);
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative flex items-center gap-3 p-2",
          "bg-background",
          "rounded-xl border",
          "transition-all duration-200",
          className
        )}
        ref={outsideClickRef}
      >
        <AnimatePresence>
          {activeNotification && (
            <motion.div
              animate="animate"
              className="absolute -top-8 left-1/2 z-50 -translate-x-1/2 transform"
              exit="exit"
              initial="initial"
              transition={{ duration: 0.3 }}
              variants={notificationVariants as any}
            >
              <div className="rounded-full bg-primary px-3 py-1 text-primary-foreground text-xs">
                {items.find((item) => item.id === activeNotification)?.title}{" "}
                clicked!
              </div>
              <motion.div
                animate="animate"
                className="absolute -bottom-1 left-1/2 h-[2px] w-full origin-left bg-primary"
                exit="exit"
                initial="initial"
                variants={lineVariants as any}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {items.map((item) => (
            <motion.button
              animate="animate"
              className={cn(
                "relative flex items-center rounded-none px-3 py-2",
                "font-medium text-sm transition-colors duration-300",
                selected === item.id
                  ? "rounded-lg bg-[#1F9CFE] text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              custom={selected === item.id}
              initial={false}
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              transition={transition as any}
              variants={buttonVariants as any}
            >
              <item.icon
                className={cn(selected === item.id && "text-white")}
                size={16}
              />
              <AnimatePresence initial={false}>
                {selected === item.id && (
                  <motion.span
                    animate="animate"
                    className="overflow-hidden"
                    exit="exit"
                    initial="initial"
                    transition={transition as any}
                    variants={spanVariants as any}
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}

          <motion.button
            className={cn(
              "flex items-center gap-2 px-4 py-2",
              "rounded-xl border shadow-sm transition-all duration-200",
              "hover:shadow-md active:border-primary/50",
              isToggled
                ? [
                    "bg-[#1F9CFE] text-white",
                    "border-[#1F9CFE]/30",
                    "hover:bg-[#1F9CFE]/90",
                    "hover:border-[#1F9CFE]/40",
                  ]
                : [
                    "bg-background text-muted-foreground",
                    "border-border/30",
                    "hover:bg-muted",
                    "hover:text-foreground",
                    "hover:border-border/40",
                  ]
            )}
            onClick={() => setIsToggled(!isToggled)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isToggled ? (
              <Edit2 className="h-3.5 w-3.5" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
            <span className="font-medium text-sm">
              {isToggled ? "On" : "Off"}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;









-------------------> Sample 9
"use client";

/**
 * @author: @dorianbaffier
 * @description: Smooth Tab
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  content?: React.ReactNode;
  cardContent?: React.ReactNode;
  color: string;
}

const WaveformPath = () => (
  <motion.path
    animate={{
      x: [0, 10, 0],
      transition: {
        duration: 5,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
      },
    }}
    d="M0 50 
           C 20 40, 40 30, 60 50
           C 80 70, 100 60, 120 50
           C 140 40, 160 30, 180 50
           C 200 70, 220 60, 240 50
           C 260 40, 280 30, 300 50
           C 320 70, 340 60, 360 50
           C 380 40, 400 30, 420 50
           L 420 100 L 0 100 Z"
    initial={false}
  />
);

function TabCardContent({
  title,
  description,
  fillClass,
}: {
  title: string;
  description: string;
  fillClass: string;
}) {
  return (
    <div className="relative h-full">
      <div className="absolute inset-0 overflow-hidden">
        <svg
          aria-hidden="true"
          className="absolute bottom-0 h-32 w-full"
          preserveAspectRatio="none"
          role="presentation"
          viewBox="0 0 420 100"
        >
          <motion.g
            animate={{ opacity: 0.15 }}
            className={`fill-${fillClass} stroke-${fillClass}`}
            initial={{ opacity: 0 }}
            style={{ strokeWidth: 1 }}
            transition={{ duration: 0.5 }}
          >
            <WaveformPath />
          </motion.g>
          <motion.g
            animate={{ opacity: 0.1 }}
            className={`fill-${fillClass} stroke-${fillClass}`}
            initial={{ opacity: 0 }}
            style={{ strokeWidth: 1, transform: "translateY(10px)" }}
            transition={{ duration: 0.5 }}
          >
            <WaveformPath />
          </motion.g>
        </svg>
      </div>
      <div className="relative flex h-full flex-col p-6">
        <div className="space-y-2">
          <h3 className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 font-semibold text-2xl tracking-tight [text-shadow:_0_1px_1px_rgb(0_0_0_/_10%)]">
            {title}
          </h3>
          <p className="max-w-[90%] text-black/50 text-sm leading-relaxed dark:text-white/50">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_TABS: TabItem[] = [
  {
    id: "Models",
    title: "Models",
    description: "Choose the model you want to use",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    id: "MCPs",
    title: "MCPs",
    description: "Choose the MCP you want to use",
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    id: "Agents",
    title: "Agents",
    description: "Choose the agent you want to use",
    color: "bg-emerald-500 hover:bg-emerald-600",
  },
  {
    id: "Users",
    title: "Users",
    description: "Choose the user you want to use",
    color: "bg-amber-500 hover:bg-amber-600",
  },
];

interface SmoothTabProps {
  items?: TabItem[];
  defaultTabId?: string;
  className?: string;
  activeColor?: string;
  onChange?: (tabId: string) => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    filter: "blur(8px)",
    scale: 0.95,
    position: "absolute" as const,
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    position: "absolute" as const,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    filter: "blur(8px)",
    scale: 0.95,
    position: "absolute" as const,
  }),
};

const transition = {
  duration: 0.4,
  ease: [0.32, 0.72, 0, 1],
};

export default function SmoothTab({
  items = DEFAULT_TABS,
  defaultTabId = DEFAULT_TABS[0].id,
  className,
  activeColor = "bg-[#1F9CFE]",
  onChange,
}: SmoothTabProps) {
  const [selected, setSelected] = React.useState<string>(defaultTabId);
  const [direction, setDirection] = React.useState(0);
  const [dimensions, setDimensions] = React.useState({ width: 0, left: 0 });

  // Reference for the selected button
  const buttonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Update dimensions whenever selected tab changes or on mount
  React.useLayoutEffect(() => {
    const updateDimensions = () => {
      const selectedButton = buttonRefs.current.get(selected);
      const container = containerRef.current;

      if (selectedButton && container) {
        const rect = selectedButton.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setDimensions({
          width: rect.width,
          left: rect.left - containerRect.left,
        });
      }
    };

    // Initial update
    requestAnimationFrame(() => {
      updateDimensions();
    });

    // Update on resize
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [selected]);

  const handleTabClick = (tabId: string) => {
    const currentIndex = items.findIndex((item) => item.id === selected);
    const newIndex = items.findIndex((item) => item.id === tabId);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelected(tabId);
    onChange?.(tabId);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    tabId: string
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTabClick(tabId);
    }
  };

  const selectedItem = items.find((item) => item.id === selected);

  return (
    <div className="flex h-full flex-col">
      {/* Card Content Area */}
      <div className="relative mb-4 flex-1">
        <div className="relative h-[200px] w-full rounded-lg border bg-card">
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <AnimatePresence
              custom={direction}
              initial={false}
              mode="popLayout"
            >
              <motion.div
                animate="center"
                className="absolute inset-0 h-full w-full bg-card will-change-transform"
                custom={direction}
                exit="exit"
                initial="enter"
                key={`card-${selected}`}
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
                transition={transition as any}
                variants={slideVariants as any}
              >
                {selectedItem?.cardContent ??
                  (selectedItem && (
                    <TabCardContent
                      description={selectedItem.description ?? ""}
                      fillClass={
                        selectedItem.color
                          .split(" ")
                          .at(0)
                          ?.replace("bg-", "") ?? "blue-500"
                      }
                      title={selectedItem.title}
                    />
                  ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div
        aria-label="Smooth tabs"
        className={cn(
          "relative mt-auto flex items-center justify-between gap-1 py-1",
          "mx-auto w-[400px] bg-background",
          "rounded-xl border",
          "transition-all duration-200",
          className
        )}
        ref={containerRef}
        role="tablist"
      >
        {/* Sliding Background */}
        <motion.div
          animate={{
            width: dimensions.width - 8,
            x: dimensions.left + 4,
            opacity: 1,
          }}
          className={cn(
            "absolute z-[1] rounded-lg",
            selectedItem?.color || activeColor
          )}
          initial={false}
          style={{ height: "calc(100% - 8px)", top: "4px" }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        />

        <div className="relative z-[2] grid w-full grid-cols-4 gap-1">
          {items.map((item) => {
            const isSelected = selected === item.id;
            return (
              <motion.button
                aria-controls={`panel-${item.id}`}
                aria-selected={isSelected}
                className={cn(
                  "relative flex items-center justify-center gap-0.5 rounded-lg px-2 py-1.5",
                  "font-medium text-sm transition-all duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "truncate",
                  isSelected
                    ? "text-white"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
                id={`tab-${item.id}`}
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                ref={(el) => {
                  if (el) buttonRefs.current.set(item.id, el);
                  else buttonRefs.current.delete(item.id);
                }}
                role="tab"
                tabIndex={isSelected ? 0 : -1}
                type="button"
              >
                <span className="truncate">{item.title}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}






-------------------> Sample 10
"use client";

import { CreditCard, FileText, LogOut, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Gemini from "../icons/gemini";

interface Profile {
  name: string;
  email: string;
  avatar: string;
  subscription?: string;
  model?: string;
}

interface MenuItem {
  label: string;
  value?: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}

const SAMPLE_PROFILE_DATA: Profile = {
  name: "Eugene An",
  email: "eugene@kokonutui.com",
  avatar:
    "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/profile-mjss82WnWBRO86MHHGxvJ2TVZuyrDv.jpeg",
  subscription: "PRO",
  model: "Gemini 2.0 Flash",
};

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: Profile;
  showTopbar?: boolean;
}

export default function ProfileDropdown({
  data = SAMPLE_PROFILE_DATA,
  className,
  ...props
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuItems: MenuItem[] = [
    {
      label: "Profile",
      href: "#",
      icon: <User className="h-4 w-4" />,
    },
    {
      label: "Model",
      value: data.model,
      href: "#",
      icon: <Gemini className="h-4 w-4" />,
    },
    {
      label: "Subscription",
      value: data.subscription,
      href: "#",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      label: "Settings",
      href: "#",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      label: "Terms & Policies",
      href: "#",
      icon: <FileText className="h-4 w-4" />,
      external: true,
    },
  ];

  return (
    <div className={cn("relative", className)} {...props}>
      <DropdownMenu onOpenChange={setIsOpen}>
        <div className="group relative">
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-16 rounded-2xl border border-zinc-200/60 bg-white p-3 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50/80 hover:shadow-sm focus:outline-none dark:border-zinc-800/60 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/40"
              type="button"
            >
              <div className="flex-1 text-left">
                <div className="font-medium text-sm text-zinc-900 leading-tight tracking-tight dark:text-zinc-100">
                  {data.name}
                </div>
                <div className="text-xs text-zinc-500 leading-tight tracking-tight dark:text-zinc-400">
                  {data.email}
                </div>
              </div>
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5">
                  <div className="h-full w-full overflow-hidden rounded-full bg-white dark:bg-zinc-900">
                    <Image
                      alt={data.name}
                      className="h-full w-full rounded-full object-cover"
                      height={36}
                      src={data.avatar}
                      width={36}
                    />
                  </div>
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>

          {/* Bending line indicator on the right */}
          <div
            className={cn(
              "absolute top-1/2 -right-3 -translate-y-1/2 transition-all duration-200",
              isOpen ? "opacity-100" : "opacity-60 group-hover:opacity-100"
            )}
          >
            <svg
              aria-hidden="true"
              className={cn(
                "transition-all duration-200",
                isOpen
                  ? "scale-110 text-blue-500 dark:text-blue-400"
                  : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300"
              )}
              fill="none"
              height="24"
              viewBox="0 0 12 24"
              width="12"
            >
              <path
                d="M2 4C6 8 6 16 2 20"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <DropdownMenuContent
            align="end"
            className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-64 origin-top-right rounded-2xl border border-zinc-200/60 bg-white/95 p-2 shadow-xl shadow-zinc-900/5 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in dark:border-zinc-800/60 dark:bg-zinc-900/95 dark:shadow-zinc-950/20"
            sideOffset={4}
          >
            <div className="space-y-1">
              {menuItems.map((item) => (
                <DropdownMenuItem asChild key={item.label}>
                  <Link
                    className="group flex cursor-pointer items-center rounded-xl border border-transparent p-3 transition-all duration-200 hover:border-zinc-200/50 hover:bg-zinc-100/80 hover:shadow-sm dark:hover:border-zinc-700/50 dark:hover:bg-zinc-800/60"
                    href={item.href}
                  >
                    <div className="flex flex-1 items-center gap-2">
                      {item.icon}
                      <span className="whitespace-nowrap font-medium text-sm text-zinc-900 leading-tight tracking-tight transition-colors group-hover:text-zinc-950 dark:text-zinc-100 dark:group-hover:text-zinc-50">
                        {item.label}
                      </span>
                    </div>
                    <div className="ml-auto flex-shrink-0">
                      {item.value && (
                        <span
                          className={cn(
                            "rounded-md px-2 py-1 font-medium text-xs tracking-tight",
                            item.label === "Model"
                              ? "border border-blue-500/10 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                              : "border border-purple-500/10 bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                          )}
                        >
                          {item.value}
                        </span>
                      )}
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>

            <DropdownMenuSeparator className="my-3 bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-800" />

            <DropdownMenuItem asChild>
              <button
                className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-red-500/10 p-3 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/20 hover:shadow-sm"
                type="button"
              >
                <LogOut className="h-4 w-4 text-red-500 group-hover:text-red-600" />
                <span className="font-medium text-red-500 text-sm group-hover:text-red-600">
                  Sign Out
                </span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
    </div>
  );
}










-------------------> Sample 11
"use client";

/**
 * @author: @kokonutui
 * @description: A modern search bar component with action buttons and suggestions
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import {
  AudioLines,
  BarChart2,
  LayoutGrid,
  PlaneTakeoff,
  Search,
  Send,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/use-debounce";

interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  short?: string;
  end?: string;
}

interface SearchResult {
  actions: Action[];
}

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.4 },
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 },
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  },
} as const;

const allActionsSample = [
  {
    id: "1",
    label: "Book tickets",
    icon: <PlaneTakeoff className="h-4 w-4 text-blue-500" />,
    description: "Operator",
    short: "⌘K",
    end: "Agent",
  },
  {
    id: "2",
    label: "Summarize",
    icon: <BarChart2 className="h-4 w-4 text-orange-500" />,
    description: "gpt-5",
    short: "⌘cmd+p",
    end: "Command",
  },
  {
    id: "3",
    label: "Screen Studio",
    icon: <Video className="h-4 w-4 text-purple-500" />,
    description: "Claude 4.1",
    short: "",
    end: "Application",
  },
  {
    id: "4",
    label: "Talk to Jarvis",
    icon: <AudioLines className="h-4 w-4 text-green-500" />,
    description: "gpt-5 voice",
    short: "",
    end: "Active",
  },
  {
    id: "5",
    label: "Kokonut UI - Pro",
    icon: <LayoutGrid className="h-4 w-4 text-blue-500" />,
    description: "Components",
    short: "",
    end: "Link",
  },
];

function ActionSearchBar({
  actions = allActionsSample,
  defaultOpen = false,
}: {
  actions?: Action[];
  defaultOpen?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isFocused, setIsFocused] = useState(defaultOpen);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 200);

  const filteredActions = useMemo(() => {
    if (!debouncedQuery) return actions;

    const normalizedQuery = debouncedQuery.toLowerCase().trim();
    return actions.filter((action) => {
      const searchableText =
        `${action.label} ${action.description || ""}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });
  }, [debouncedQuery, actions]);

  useEffect(() => {
    if (!isFocused) {
      setResult(null);
      setActiveIndex(-1);
      return;
    }

    setResult({ actions: filteredActions });
    setActiveIndex(-1);
  }, [filteredActions, isFocused]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      setIsTyping(true);
      setActiveIndex(-1);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!result?.actions.length) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < result.actions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : result.actions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && result.actions[activeIndex]) {
            setSelectedAction(result.actions[activeIndex]);
          }
          break;
        case "Escape":
          setIsFocused(false);
          setActiveIndex(-1);
          break;
      }
    },
    [result?.actions, activeIndex]
  );

  const handleActionClick = useCallback((action: Action) => {
    setSelectedAction(action);
  }, []);

  const handleFocus = useCallback(() => {
    setSelectedAction(null);
    setIsFocused(true);
    setActiveIndex(-1);
  }, []);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsFocused(false);
      setActiveIndex(-1);
    }, 200);
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="relative flex min-h-[300px] flex-col items-center justify-start">
        <div className="sticky top-0 z-10 w-full max-w-sm bg-background pt-4 pb-1">
          <label
            className="mb-1 block font-medium text-gray-500 text-xs dark:text-gray-400"
            htmlFor="search"
          >
            Search Commands
          </label>
          <div className="relative">
            <Input
              aria-activedescendant={
                activeIndex >= 0
                  ? `action-${result?.actions[activeIndex]?.id}`
                  : undefined
              }
              aria-autocomplete="list"
              aria-expanded={isFocused && !!result}
              autoComplete="off"
              className="h-9 rounded-lg py-1.5 pr-9 pl-3 text-sm focus-visible:ring-offset-0"
              id="search"
              onBlur={handleBlur}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              placeholder="What's up?"
              role="combobox"
              type="text"
              value={query}
            />
            <div className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2">
              <AnimatePresence mode="popLayout">
                {query.length > 0 ? (
                  <motion.div
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    initial={{ y: -20, opacity: 0 }}
                    key="send"
                    transition={{ duration: 0.2 }}
                  >
                    <Send className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    initial={{ y: -20, opacity: 0 }}
                    key="search"
                    transition={{ duration: 0.2 }}
                  >
                    <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <AnimatePresence>
            {isFocused && result && !selectedAction && (
              <motion.div
                animate="show"
                aria-label="Search results"
                className="mt-1 w-full overflow-hidden rounded-md border bg-white shadow-xs dark:border-gray-800 dark:bg-black"
                exit="exit"
                initial="hidden"
                role="listbox"
                variants={ANIMATION_VARIANTS.container}
              >
                <motion.ul role="none">
                  {result.actions.map((action) => (
                    <motion.li
                      aria-selected={
                        activeIndex === result.actions.indexOf(action)
                      }
                      className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 hover:bg-gray-200 dark:hover:bg-zinc-900 ${
                        activeIndex === result.actions.indexOf(action)
                          ? "bg-gray-100 dark:bg-zinc-800"
                          : ""
                      }`}
                      id={`action-${action.id}`}
                      key={action.id}
                      layout
                      onClick={() => handleActionClick(action)}
                      role="option"
                      variants={ANIMATION_VARIANTS.item}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span aria-hidden="true" className="text-gray-500">
                            {action.icon}
                          </span>
                          <span className="font-medium text-gray-900 text-sm dark:text-gray-100">
                            {action.label}
                          </span>
                          {action.description && (
                            <span className="text-gray-400 text-xs">
                              {action.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {action.short && (
                          <span
                            aria-label={`Keyboard shortcut: ${action.short}`}
                            className="text-gray-400 text-xs"
                          >
                            {action.short}
                          </span>
                        )}
                        {action.end && (
                          <span className="text-right text-gray-400 text-xs">
                            {action.end}
                          </span>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
                <div className="mt-2 border-gray-100 border-t px-3 py-2 dark:border-gray-800">
                  <div className="flex items-center justify-between text-gray-500 text-xs">
                    <span>Press ⌘K to open commands</span>
                    <span>ESC to cancel</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default ActionSearchBar;







-------------------> Sample 12
"use client";

/**
 * @author: @dorianbaffier
 * @description: Smooth Drawer
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { Fingerprint } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface PriceTagProps {
  price: number;
  discountedPrice: number;
}

function PriceTag({ price, discountedPrice }: PriceTagProps) {
  return (
    <div className="mx-auto flex max-w-fit items-center justify-around gap-4">
      <div className="flex items-baseline gap-2">
        <span className="bg-gradient-to-br from-zinc-900 to-zinc-700 bg-clip-text font-bold text-4xl text-transparent dark:from-white dark:to-zinc-300">
          ${discountedPrice}
        </span>
        <span className="text-lg text-zinc-400 line-through dark:text-zinc-500">
          ${price}
        </span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
          Lifetime access
        </span>
        <span className="text-xs text-zinc-700 dark:text-zinc-300">
          One-time payment
        </span>
      </div>
    </div>
  );
}

interface DrawerDemoProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  price?: number;
  discountedPrice?: number;
}

const drawerVariants = {
  hidden: {
    y: "100%",
    opacity: 0,
    rotateX: 5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    y: 20,
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
};

export default function SmoothDrawer({
  title = "KokonutUI - Pro",
  description = "100+ collection of UI Components and templates built for React, Next.js, and Tailwind CSS. Spend no time on design and focus on shipping.",
  primaryButtonText = "Buy Now",
  secondaryButtonText = "Maybe Later",
  onSecondaryAction,
  price = 169,
  discountedPrice = 99,
}: DrawerDemoProps) {
  const handleSecondaryClick = () => {
    onSecondaryAction?.();
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto max-w-fit rounded-2xl p-6 shadow-xl">
        <motion.div
          animate="visible"
          className="mx-auto w-full max-w-[340px] space-y-6"
          initial="hidden"
          variants={drawerVariants as any}
        >
          <motion.div variants={itemVariants as any}>
            <DrawerHeader className="space-y-2.5 px-0">
              <DrawerTitle className="flex items-center gap-2.5 font-semibold text-2xl tracking-tighter">
                <motion.div variants={itemVariants as any}>
                  <div className="rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 p-1.5 shadow-inner dark:from-zinc-800 dark:to-zinc-900">
                    <Image alt="Logo" height={32} src="/logo.svg" width={32} />
                  </div>
                </motion.div>
                <motion.span variants={itemVariants as any}>
                  {title}
                </motion.span>
              </DrawerTitle>
              <motion.div variants={itemVariants as any}>
                <DrawerDescription className="text-sm text-zinc-600 leading-relaxed tracking-tighter dark:text-zinc-400">
                  {description}
                </DrawerDescription>
              </motion.div>
            </DrawerHeader>
          </motion.div>

          <motion.div variants={itemVariants as any}>
            <PriceTag discountedPrice={discountedPrice} price={price} />
          </motion.div>

          <motion.div variants={itemVariants as any}>
            <DrawerFooter className="flex flex-col gap-3 px-0">
              <div className="w-full">
                <Link
                  className="group relative inline-flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 font-semibold text-sm text-white tracking-wide shadow-lg shadow-rose-500/20 transition-all duration-500 hover:from-rose-600 hover:to-pink-600 hover:shadow-rose-500/30 hover:shadow-xl dark:from-rose-600 dark:to-pink-600 dark:hover:from-rose-500 dark:hover:to-pink-500"
                  href="https://kokonutui.pro/#pricing"
                  target="_blank"
                >
                  <motion.span
                    className="absolute inset-0 translate-x-[-200%] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      repeat: 0,
                    }}
                    whileHover={{
                      x: ["-200%", "200%"],
                    }}
                  />
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="relative flex items-center gap-2 tracking-tighter"
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {primaryButtonText}
                    <motion.div
                      animate={{
                        rotate: [0, 15, -15, 0],
                        y: [0, -2, 2, 0],
                      }}
                      transition={{
                        duration: 2,
                        ease: "easeInOut",
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: 1,
                      }}
                    >
                      <Fingerprint className="h-4 w-4" />
                    </motion.div>
                  </motion.div>
                </Link>
              </div>
              <DrawerClose asChild>
                <Button
                  className="h-11 w-full rounded-xl border-zinc-200 font-semibold text-sm tracking-tighter transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800/80"
                  onClick={handleSecondaryClick}
                  variant="outline"
                >
                  {secondaryButtonText}
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </motion.div>
        </motion.div>
      </DrawerContent>
    </Drawer>
  );
}





-------------------> Sample 13
"use client";

/**
 * @author: @dorianbaffier
 * @description: Attract Button
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { Magnet } from "lucide-react";
import { motion, useAnimation } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AttractButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  particleCount?: number;
  attractRadius?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
}

export default function AttractButton({
  className,
  particleCount = 12,
  attractRadius = 50,
  ...props
}: AttractButtonProps) {
  const [isAttracting, setIsAttracting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particlesControl = useAnimation();

  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 360 - 180,
      y: Math.random() * 360 - 180,
    }));
    setParticles(newParticles);
  }, [particleCount]);

  const handleInteractionStart = useCallback(async () => {
    setIsAttracting(true);
    await particlesControl.start({
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 10,
      },
    });
  }, [particlesControl]);

  const handleInteractionEnd = useCallback(async () => {
    setIsAttracting(false);
    await particlesControl.start((i) => ({
      x: particles[i].x,
      y: particles[i].y,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    }));
  }, [particlesControl, particles]);

  return (
    <Button
      className={cn(
        "relative min-w-40 touch-none",
        "bg-violet-100 dark:bg-violet-900",
        "hover:bg-violet-200 dark:hover:bg-violet-800",
        "text-violet-600 dark:text-violet-300",
        "border border-violet-300 dark:border-violet-700",
        "transition-all duration-300",
        className
      )}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchEnd={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      {...props}
    >
      {particles.map((_, index) => (
        <motion.div
          animate={particlesControl}
          className={cn(
            "absolute h-1.5 w-1.5 rounded-full",
            "bg-violet-400 dark:bg-violet-300",
            "transition-opacity duration-300",
            isAttracting ? "opacity-100" : "opacity-40"
          )}
          custom={index}
          initial={{ x: particles[index].x, y: particles[index].y }}
          key={index}
        />
      ))}
      <span className="relative flex w-full items-center justify-center gap-2">
        <Magnet
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            isAttracting && "scale-110"
          )}
        />
        {isAttracting ? "Attracting" : "Hover me"}
      </span>
    </Button>
  );
}







-------------------> Sample 14
"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
}

export default function Loader({
  title = "Configuring your account...",
  subtitle = "Please wait while we prepare everything for you",
  size = "md",
  className,
  ...props
}: LoaderProps) {
  const sizeConfig = {
    sm: {
      container: "size-20",
      titleClass: "text-sm/tight font-medium",
      subtitleClass: "text-xs/relaxed",
      spacing: "space-y-2",
      maxWidth: "max-w-48",
    },
    md: {
      container: "size-32",
      titleClass: "text-base/snug font-medium",
      subtitleClass: "text-sm/relaxed",
      spacing: "space-y-3",
      maxWidth: "max-w-56",
    },
    lg: {
      container: "size-40",
      titleClass: "text-lg/tight font-semibold",
      subtitleClass: "text-base/relaxed",
      spacing: "space-y-4",
      maxWidth: "max-w-64",
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-8 p-8",
        className
      )}
      {...props}
    >
      {/* Enhanced Monochrome Loader */}
      <motion.div
        animate={{
          scale: [1, 1.02, 1],
        }}
        className={cn("relative", config.container)}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: [0.4, 0, 0.6, 1],
        }}
      >
        {/* Outer elegant ring with shimmer */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgb(0, 0, 0) 90deg, transparent 180deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            opacity: 0.8,
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Primary animated ring with gradient */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgb(0, 0, 0) 120deg, rgba(0, 0, 0, 0.5) 240deg, transparent 360deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            opacity: 0.9,
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.4, 0, 0.6, 1],
          }}
        />

        {/* Secondary elegant ring - counter rotation */}
        <motion.div
          animate={{
            rotate: [0, -360],
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 180deg, transparent 0deg, rgba(0, 0, 0, 0.6) 45deg, transparent 90deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            opacity: 0.35,
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.4, 0, 0.6, 1],
          }}
        />

        {/* Accent particles */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 270deg, transparent 0deg, rgba(0, 0, 0, 0.4) 20deg, transparent 40deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            opacity: 0.5,
          }}
          transition={{
            duration: 3.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Dark mode variants */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          className="absolute inset-0 hidden rounded-full dark:block"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgb(255, 255, 255) 90deg, transparent 180deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            opacity: 0.8,
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          className="absolute inset-0 hidden rounded-full dark:block"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgb(255, 255, 255) 120deg, rgba(255, 255, 255, 0.5) 240deg, transparent 360deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            opacity: 0.9,
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.4, 0, 0.6, 1],
          }}
        />

        <motion.div
          animate={{
            rotate: [0, -360],
          }}
          className="absolute inset-0 hidden rounded-full dark:block"
          style={{
            background:
              "conic-gradient(from 180deg, transparent 0deg, rgba(255, 255, 255, 0.6) 45deg, transparent 90deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            opacity: 0.35,
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.4, 0, 0.6, 1],
          }}
        />

        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          className="absolute inset-0 hidden rounded-full dark:block"
          style={{
            background:
              "conic-gradient(from 270deg, transparent 0deg, rgba(255, 255, 255, 0.4) 20deg, transparent 40deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            opacity: 0.5,
          }}
          transition={{
            duration: 3.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </motion.div>

      {/* Enhanced Typography with Breathing Animation */}
      <motion.div
        animate={{
          opacity: 1,
          y: 0,
        }}
        className={cn("text-center", config.spacing, config.maxWidth)}
        initial={{ opacity: 0, y: 12 }}
        transition={{
          delay: 0.4,
          duration: 1,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {/* Clean title with subtle animation */}
        <motion.h1
          animate={{
            opacity: 1,
            y: 0,
          }}
          className={cn(
            config.titleClass,
            "font-medium text-black/90 leading-[1.15] tracking-[-0.02em] antialiased dark:text-white/90"
          )}
          initial={{ opacity: 0, y: 12 }}
          transition={{
            delay: 0.6,
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <motion.span
            animate={{
              opacity: [0.9, 0.7, 0.9],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: [0.4, 0, 0.6, 1],
            }}
          >
            {title}
          </motion.span>
        </motion.h1>

        {/* Clean subtitle with subtle animation */}
        <motion.p
          animate={{
            opacity: 1,
            y: 0,
          }}
          className={cn(
            config.subtitleClass,
            "font-normal text-black/60 leading-[1.45] tracking-[-0.01em] antialiased dark:text-white/60"
          )}
          initial={{ opacity: 0, y: 8 }}
          transition={{
            delay: 0.8,
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <motion.span
            animate={{
              opacity: [0.6, 0.4, 0.6],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: [0.4, 0, 0.6, 1],
            }}
          >
            {subtitle}
          </motion.span>
        </motion.p>
      </motion.div>
    </div>
  );
}
