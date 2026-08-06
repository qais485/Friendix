import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { LiquidGlassFilter } from "./LiquidGlassFilter";
import type { BezelType } from "./refraction";

const SPRING = { stiffness: 320, damping: 28, mass: 0.9 };

interface Geometry {
  width: number;
  height: number;
}

export interface LiquidGlassActiveIndicatorProps {
  /** CSS selector used to locate the active element inside the container. */
  activeSelector?: string;
  /** Spring tuning for the sliding capsule. */
  transition?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
  bezelType?: BezelType;
  /** Capsule side (top/bottom) padding multiplier applied to the bezel. */
  bezelScale?: number;
  /** Stronger value = more visible refraction at the pill edges. */
  glassThickness?: number;
  refractiveIndex?: number;
  specularOpacity?: number;
  specularSaturation?: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/**
 * Reusable "liquid glass" active indicator. Rendered once inside a `relative`
 * container (e.g. a sidebar nav). It measures whichever element matches
 * `activeSelector` (`[aria-current="page"]` by default, which react-router's
 * NavLink sets automatically) and slides a single glass capsule over it using
 * spring motion values — no React state is involved in the animation itself.
 */
export function LiquidGlassActiveIndicator({
  activeSelector = '[aria-current="page"]',
  transition,
  bezelType = "convex_squircle",
  bezelScale = 0.25,
  glassThickness,
  refractiveIndex = 1.5,
  specularOpacity = 0.5,
  specularSaturation = 9,
}: LiquidGlassActiveIndicatorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const filterIdRef = useRef<string | null>(null);
  if (filterIdRef.current === null) {
    filterIdRef.current = `liquid-glass-${Math.random().toString(36).slice(2, 10)}`;
  }
  const filterId = filterIdRef.current;

  const springConfig = useMemo(
    () => ({ ...SPRING, ...transition }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const top = useSpring(0, springConfig);
  const left = useSpring(0, springConfig);
  const width = useSpring(0, springConfig);
  const height = useSpring(0, springConfig);
  const borderRadius = useTransform(height, (h) => h / 2);

  // The refraction/specular maps are generated once per capsule size. Sizes
  // only change on collapse/expand, so this state update is rare.
  const [geometry, setGeometry] = useState<Geometry | null>(null);

  // Subtle "materialisation": refraction eases in when the indicator mounts.
  const refractionLevel = useSpring(0.6, { stiffness: 250, damping: 14 });
  useEffect(() => {
    refractionLevel.set(1);
  }, [refractionLevel]);

  // --- Liquid motion (ported from MagnifyingGlass) -------------------------
  // Every frame, sample the position springs' velocity + animation state into
  // MotionValues so the deformation, shadow and refraction react to motion.
  // This is all MotionValue-driven; no React state, no extra renders.
  const vx = useMotionValue(0);
  const vy = useMotionValue(0);
  const isMoving = useMotionValue(0);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      vx.set(left.getVelocity());
      vy.set(top.getVelocity());
      isMoving.set(left.isAnimating() || top.isAnimating() ? 1 : 0);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [left, top, vx, vy, isMoving]);

  // 0..1 eased analog of "flowing right now".
  const activity = useSpring(isMoving, { stiffness: 300, damping: 32 });

  // Squash & stretch: compressed slightly at rest, stretches while flowing
  // along the (vertical) travel axis and compresses crosswise — volume is
  // conserved (scaleX * scaleY stays ~1).
  const settleScale = useTransform(activity, (a) => 1 - (1 - a) * 0.04);
  const motionFactor = useTransform(
    () => Math.min(0.14, (Math.abs(vy.get()) + Math.abs(vx.get())) / 3200),
  );
  const scaleY = useSpring(
    useTransform(() => settleScale.get() * (1 + motionFactor.get())),
    { stiffness: 340, damping: 26 },
  );
  const scaleX = useSpring(
    useTransform(() => settleScale.get() * (1 - motionFactor.get())),
    { stiffness: 340, damping: 26 },
  );

  // Dynamic shadow: softer + stronger while flowing, tight + subtle at rest.
  const shadowBlur = useSpring(
    useTransform(activity, (a) => 8 + a * 16),
    { stiffness: 300, damping: 30 },
  );
  const shadowAlpha = useSpring(
    useTransform(activity, (a) => 0.14 + a * 0.1),
    { stiffness: 300, damping: 30 },
  );
  const insetAlpha = useSpring(
    useTransform(activity, (a) => 0.16 + a * 0.1),
    { stiffness: 300, damping: 30 },
  );
  const boxShadow = useTransform(
    () =>
      [
        `0px 3px ${shadowBlur.get().toFixed(1)}px rgba(0,0,0,${shadowAlpha
          .get()
          .toFixed(3)})`,
        "inset 0 1px 0 rgba(255,255,255,0.55)",
        "inset 0 0 0 1px rgba(255,255,255,0.30)",
        `inset 0px 2px 20px rgba(0,0,0,${insetAlpha.get().toFixed(3)})`,
        `inset 0px -2px 20px rgba(255,255,255,${(insetAlpha.get() * 0.7).toFixed(3)})`,
      ].join(", "),
  );

  // Refraction + specular brighten slightly while moving (the reference's
  // "dragMultiplier" behaviour).
  const refractionScale = useTransform(
    () => refractionLevel.get() * (1 + activity.get() * 0.35),
  );
  const specularMotion = useTransform(
    () => specularOpacity * (1 + activity.get() * 0.15),
  );

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const parent = container.parentElement;
    if (!parent) return;
    const active = parent.querySelector(activeSelector) as HTMLElement | null;
    if (!active) return;

    const parentRect = parent.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    const t = activeRect.top - parentRect.top;
    const l = activeRect.left - parentRect.left;
    const w = activeRect.width;
    const h = activeRect.height;

    top.set(t);
    left.set(l);
    width.set(w);
    height.set(h);

    setGeometry((prev) => {
      if (
        prev &&
        Math.abs(prev.width - w) < 1 &&
        Math.abs(prev.height - h) < 1
      ) {
        return prev;
      }
      return { width: w, height: h };
    });
  }, [top, left, width, height]);

  useEffect(() => {
    measure();
    const container = containerRef.current;
    const parent = container?.parentElement ?? null;
    if (!parent) return;

    const ro = new ResizeObserver(measure);
    ro.observe(parent);

    const mo = new MutationObserver(measure);
    mo.observe(parent, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-current", "class"],
    });

    const onScroll = () => measure();
    parent.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);

    return () => {
      ro.disconnect();
      mo.disconnect();
      parent.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure]);

  const pillRadius = geometry ? geometry.height / 2 : 0;

  const glassThicknessValue = useMemo(
    () =>
      geometry
        ? glassThickness ?? Math.max(48, Math.round(geometry.height * 1.5))
        : 0,
    [geometry, glassThickness],
  );

  const bezelWidth = geometry
    ? clamp(Math.round(geometry.height * bezelScale), 6, 24)
    : 0;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    >
      {geometry && (
        <motion.div
          className="absolute"
          style={{ top, left, width, height, borderRadius, scaleX, scaleY }}
        >
          <LiquidGlassFilter
            id={filterId}
            width={geometry.width}
            height={geometry.height}
            radius={pillRadius}
            bezelWidth={bezelWidth}
            glassThickness={glassThicknessValue}
            refractiveIndex={refractiveIndex}
            bezelType={bezelType}
            magnify={false}
            blur={0}
            scaleRatio={refractionScale}
            specularOpacity={specularMotion}
            specularSaturation={specularSaturation}
          />

          {/* Base frosted layer — the pill stays visible even if the SVG
              refraction filter is unsupported or fails to load. */}
          <motion.div
            className="absolute inset-0"
            style={{
              borderRadius: "inherit",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05))",
              backdropFilter: "blur(16px) saturate(1.5)",
              WebkitBackdropFilter: "blur(16px) saturate(1.5)",
              border: "1px solid rgba(255,255,255,0.20)",
              boxShadow,
            }}
          />

          {/* SVG refraction enhancement — displacement + specular rim. */}
          <motion.div
            className="absolute inset-0"
            style={{
              borderRadius: "inherit",
              backdropFilter: `url(#${filterId})`,
              WebkitBackdropFilter: `url(#${filterId})`,
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
