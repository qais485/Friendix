import { useMemo } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import {
  buildLiquidGlassMaps,
  type BezelType,
} from "./refraction";

export type MotionOrNumber<T> = T | MotionValue<T>;

function getValueOrMotion<T>(value: MotionOrNumber<T>): T {
  if (
    value !== null &&
    typeof value === "object" &&
    "get" in value &&
    typeof (value as MotionValue<T>).get === "function"
  ) {
    return (value as MotionValue<T>).get();
  }
  return value as T;
}

export interface LiquidGlassFilterProps {
  id: string;
  width: number;
  height: number;
  radius: number;
  bezelWidth: number;
  glassThickness: number;
  refractiveIndex: number;
  bezelType?: BezelType;
  magnify?: boolean;
  blur?: MotionOrNumber<number>;
  scaleRatio?: MotionOrNumber<number>;
  specularOpacity?: MotionOrNumber<number>;
  specularSaturation?: MotionOrNumber<number>;
  magnifyingScale?: MotionOrNumber<number>;
  dpr?: number;
}

/**
 * SVG filter pipeline ported 1:1 from the reference `virtual:refractionFilter`
 * module (kube.io "Liquid Glass in the Browser"). The displacement + specular
 * maps are generated at runtime with a browser canvas instead of at build time.
 */
export function LiquidGlassFilter({
  id,
  width,
  height,
  radius,
  bezelWidth,
  glassThickness,
  refractiveIndex,
  bezelType = "convex_squircle",
  magnify = false,
  blur = 0,
  scaleRatio = 1,
  specularOpacity = 0.4,
  specularSaturation = 4,
  magnifyingScale,
  dpr,
}: LiquidGlassFilterProps) {
  const maps = useMemo(
    () =>
      buildLiquidGlassMaps({
        width,
        height,
        radius,
        bezelWidth,
        glassThickness,
        refractiveIndex,
        bezelType,
        magnify,
        dpr,
      }),
    [width, height, radius, bezelWidth, glassThickness, refractiveIndex, bezelType, magnify, dpr],
  );

  const scale = useTransform(() => {
    const ratio = getValueOrMotion(scaleRatio);
    return maps.maxDisplacement * ratio;
  });

  const specularSaturationValue = useTransform(() => {
    const value = getValueOrMotion(specularSaturation);
    return value.toString();
  });

  const magnifyingScaleValue = magnify
    ? useTransform(() => getValueOrMotion(magnifyingScale ?? 24))
    : undefined;

  const magnifyingScaleAttr =
    magnifyingScaleValue !== undefined ? magnifyingScaleValue : 24;

  return (
    <svg
      colorInterpolationFilters="sRGB"
      style={{
        position: "absolute",
        inset: 0,
        width: 0,
        height: 0,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={id} colorInterpolationFilters="sRGB">
          {magnify && (
            <>
              <motion.feImage
                href={maps.magnifyingUrl}
                x={0}
                y={0}
                width={width}
                height={height}
                result="magnifying_displacement_map"
              />
              <motion.feDisplacementMap
                in="SourceGraphic"
                in2="magnifying_displacement_map"
                scale={magnifyingScaleAttr}
                xChannelSelector="R"
                yChannelSelector="G"
                result="magnified_source"
              />
            </>
          )}

          <motion.feGaussianBlur
            in={magnify ? "magnified_source" : "SourceGraphic"}
            stdDeviation={blur}
            result="blurred_source"
          />

          <motion.feImage
            href={maps.displacementUrl}
            x={0}
            y={0}
            width={width}
            height={height}
            result="displacement_map"
          />

          <motion.feDisplacementMap
            in="blurred_source"
            in2="displacement_map"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />

          <motion.feColorMatrix
            in="displaced"
            type="saturate"
            values={specularSaturationValue}
            result="displaced_saturated"
          />

          <motion.feImage
            href={maps.specularUrl}
            x={0}
            y={0}
            width={width}
            height={height}
            result="specular_layer"
          />

          <feComposite
            in="displaced_saturated"
            in2="specular_layer"
            operator="in"
            result="specular_saturated"
          />

          <feComponentTransfer in="specular_layer" result="specular_faded">
            <motion.feFuncA
              type="linear"
              slope={specularOpacity}
            />
          </feComponentTransfer>

          <motion.feBlend
            in="specular_saturated"
            in2="displaced"
            mode="normal"
            result="withSaturation"
          />
          <motion.feBlend in="specular_faded" in2="withSaturation" mode="normal" />
        </filter>
      </defs>
    </svg>
  );
}
