export type BezelType = "convex_circle" | "convex_squircle" | "concave" | "lip";

type SurfaceFn = (x: number) => number;

const CONVEX_CIRCLE: SurfaceFn = (x) => Math.sqrt(1 - (1 - x) ** 2);

const CONVEX_SQUIRCLE: SurfaceFn = (x) => Math.pow(1 - Math.pow(1 - x, 4), 1 / 4);

const CONCAVE: SurfaceFn = (x) => 1 - CONVEX_CIRCLE(x);

const LIP: SurfaceFn = (x) => {
  const convex = CONVEX_SQUIRCLE(x * 2);
  const concave = CONCAVE(x) + 0.1;
  const smootherstep = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  return convex * (1 - smootherstep) + concave * smootherstep;
};

const SURFACE_FNS: Record<BezelType, SurfaceFn> = {
  convex_circle: CONVEX_CIRCLE,
  convex_squircle: CONVEX_SQUIRCLE,
  concave: CONCAVE,
  lip: LIP,
};

export function getSurfaceFn(type: BezelType): SurfaceFn {
  return SURFACE_FNS[type] ?? CONVEX_SQUIRCLE;
}

export function calculateDisplacementProfile(
  glassThickness: number = 200,
  bezelWidth: number = 50,
  bezelHeightFn: SurfaceFn = (x) => x,
  refractiveIndex: number = 1.5,
  samples: number = 128,
): number[] {
  const eta = 1 / refractiveIndex;

  function refract(normalX: number, normalY: number): [number, number] | null {
    const dot = normalY;
    const k = 1 - eta * eta * (1 - dot * dot);
    if (k < 0) return null;
    const kSqrt = Math.sqrt(k);
    return [
      -(eta * dot + kSqrt) * normalX,
      eta - (eta * dot + kSqrt) * normalY,
    ];
  }

  return Array.from({ length: samples }, (_, i) => {
    const x = i / samples;
    const y = bezelHeightFn(x);
    const dx = x < 1 ? 0.0001 : -0.0001;
    const y2 = bezelHeightFn(x + dx);
    const derivative = (y2 - y) / dx;
    const magnitude = Math.sqrt(derivative * derivative + 1);
    const normal = [-derivative / magnitude, -1 / magnitude];
    const refracted = refract(normal[0], normal[1]);

    if (!refracted) return 0;
    const remainingHeightOnBezel = y * bezelWidth;
    const remainingHeight = remainingHeightOnBezel + glassThickness;
    return refracted[0] * (remainingHeight / refracted[1]);
  });
}

export function calculateDisplacementMap(
  canvasWidth: number,
  canvasHeight: number,
  objectWidth: number,
  objectHeight: number,
  radius: number,
  bezelWidth: number,
  maximumDisplacement: number,
  precomputedDisplacementMap: number[] = [],
  dpr?: number,
): ImageData {
  const devicePixelRatio =
    dpr ?? (typeof window !== "undefined" ? (window.devicePixelRatio ?? 1) : 1);
  const bufferWidth = canvasWidth * devicePixelRatio;
  const bufferHeight = canvasHeight * devicePixelRatio;
  const imageData = new ImageData(bufferWidth, bufferHeight);

  const neutral = 0xff008080;
  new Uint32Array(imageData.data.buffer).fill(neutral);

  const radius_ = radius * devicePixelRatio;
  const bezel = bezelWidth * devicePixelRatio;

  const radiusSquared = radius_ ** 2;
  const radiusPlusOneSquared = (radius_ + 1) ** 2;
  const radiusMinusBezelSquared = (radius_ - bezel) ** 2;

  const objectWidth_ = objectWidth * devicePixelRatio;
  const objectHeight_ = objectHeight * devicePixelRatio;
  const widthBetweenRadiuses = objectWidth_ - radius_ * 2;
  const heightBetweenRadiuses = objectHeight_ - radius_ * 2;

  const objectX = (bufferWidth - objectWidth_) / 2;
  const objectY = (bufferHeight - objectHeight_) / 2;

  for (let y1 = 0; y1 < objectHeight_; y1++) {
    for (let x1 = 0; x1 < objectWidth_; x1++) {
      const idx = ((objectY + y1) * bufferWidth + objectX + x1) * 4;

      const isOnLeftSide = x1 < radius_;
      const isOnRightSide = x1 >= objectWidth_ - radius_;
      const isOnTopSide = y1 < radius_;
      const isOnBottomSide = y1 >= objectHeight_ - radius_;

      const x = isOnLeftSide
        ? x1 - radius_
        : isOnRightSide
          ? x1 - radius_ - widthBetweenRadiuses
          : 0;

      const y = isOnTopSide
        ? y1 - radius_
        : isOnBottomSide
          ? y1 - radius_ - heightBetweenRadiuses
          : 0;

      const distanceToCenterSquared = x * x + y * y;

      const isInBezel =
        distanceToCenterSquared <= radiusPlusOneSquared &&
        distanceToCenterSquared >= radiusMinusBezelSquared;

      if (isInBezel) {
        const opacity =
          distanceToCenterSquared < radiusSquared
            ? 1
            : 1 -
              (Math.sqrt(distanceToCenterSquared) - Math.sqrt(radiusSquared)) /
                (Math.sqrt(radiusPlusOneSquared) - Math.sqrt(radiusSquared));

        const distanceFromCenter = Math.sqrt(distanceToCenterSquared);
        const distanceFromSide = radius_ - distanceFromCenter;

        const cos = x / distanceFromCenter;
        const sin = y / distanceFromCenter;

        const bezelIndex =
          ((distanceFromSide / bezel) * precomputedDisplacementMap.length) | 0;
        const distance = precomputedDisplacementMap[bezelIndex] ?? 0;

        const dX = (-cos * distance) / maximumDisplacement;
        const dY = (-sin * distance) / maximumDisplacement;

        imageData.data[idx] = 128 + dX * 127 * opacity;
        imageData.data[idx + 1] = 128 + dY * 127 * opacity;
        imageData.data[idx + 2] = 0;
        imageData.data[idx + 3] = 255;
      }
    }
  }
  return imageData;
}

export function calculateRefractionSpecular(
  objectWidth: number,
  objectHeight: number,
  radius: number,
  bezelWidth: number,
  specularAngle = Math.PI / 3,
  dpr?: number,
): ImageData {
  const devicePixelRatio =
    dpr ?? (typeof window !== "undefined" ? (window.devicePixelRatio ?? 1) : 1);
  const bufferWidth = objectWidth * devicePixelRatio;
  const bufferHeight = objectHeight * devicePixelRatio;
  const imageData = new ImageData(bufferWidth, bufferHeight);

  const radius_ = radius * devicePixelRatio;
  const bezel_ = bezelWidth * devicePixelRatio;

  const specular_vector = [Math.cos(specularAngle), Math.sin(specularAngle)];

  const neutral = 0x00000000;
  new Uint32Array(imageData.data.buffer).fill(neutral);

  const radiusSquared = radius_ ** 2;
  const radiusPlusOneSquared = (radius_ + devicePixelRatio) ** 2;
  const radiusMinusBezelSquared = (radius_ - bezel_) ** 2;

  const widthBetweenRadiuses = bufferWidth - radius_ * 2;
  const heightBetweenRadiuses = bufferHeight - radius_ * 2;

  for (let y1 = 0; y1 < bufferHeight; y1++) {
    for (let x1 = 0; x1 < bufferWidth; x1++) {
      const idx = (y1 * bufferWidth + x1) * 4;

      const isOnLeftSide = x1 < radius_;
      const isOnRightSide = x1 >= bufferWidth - radius_;
      const isOnTopSide = y1 < radius_;
      const isOnBottomSide = y1 >= bufferHeight - radius_;

      const x = isOnLeftSide
        ? x1 - radius_
        : isOnRightSide
          ? x1 - radius_ - widthBetweenRadiuses
          : 0;

      const y = isOnTopSide
        ? y1 - radius_
        : isOnBottomSide
          ? y1 - radius_ - heightBetweenRadiuses
          : 0;

      const distanceToCenterSquared = x * x + y * y;

      const isInBezel =
        distanceToCenterSquared <= radiusPlusOneSquared &&
        distanceToCenterSquared >= radiusMinusBezelSquared;

      if (isInBezel) {
        const distanceFromCenter = Math.sqrt(distanceToCenterSquared);
        const distanceFromSide = radius_ - distanceFromCenter;

        const opacity =
          distanceToCenterSquared < radiusSquared
            ? 1
            : 1 -
              (distanceFromCenter - Math.sqrt(radiusSquared)) /
                (Math.sqrt(radiusPlusOneSquared) - Math.sqrt(radiusSquared));

        const cos = x / distanceFromCenter;
        const sin = -y / distanceFromCenter;

        const dotProduct = Math.abs(
          cos * specular_vector[0] + sin * specular_vector[1],
        );

        const coefficient =
          dotProduct *
          Math.sqrt(1 - (1 - distanceFromSide / devicePixelRatio) ** 2);

        const color = 255 * coefficient;
        const finalOpacity = color * coefficient * opacity;

        imageData.data[idx] = color;
        imageData.data[idx + 1] = color;
        imageData.data[idx + 2] = color;
        imageData.data[idx + 3] = finalOpacity;
      }
    }
  }
  return imageData;
}

export function calculateMagnifyingDisplacementMap(
  canvasWidth: number,
  canvasHeight: number,
  dpr?: number,
): ImageData {
  const devicePixelRatio =
    dpr ?? (typeof window !== "undefined" ? (window.devicePixelRatio ?? 1) : 1);
  const bufferWidth = canvasWidth * devicePixelRatio;
  const bufferHeight = canvasHeight * devicePixelRatio;
  const imageData = new ImageData(bufferWidth, bufferHeight);

  const ratio = Math.max(bufferWidth / 2, bufferHeight / 2);

  for (let y1 = 0; y1 < bufferHeight; y1++) {
    for (let x1 = 0; x1 < bufferWidth; x1++) {
      const idx = (y1 * bufferWidth + x1) * 4;

      const x = x1 - bufferWidth / 2;
      const y = y1 - bufferHeight / 2;

      const rX = x / ratio;
      const rY = y / ratio;

      imageData.data[idx] = 128 - rX * 127;
      imageData.data[idx + 1] = 128 - rY * 127;
      imageData.data[idx + 2] = 0;
      imageData.data[idx + 3] = 255;
    }
  }
  return imageData;
}

export function imageDataToUrl(imageData: ImageData): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

export interface LiquidGlassMaps {
  displacementUrl: string;
  specularUrl: string;
  magnifyingUrl?: string;
  maxDisplacement: number;
}

export function buildLiquidGlassMaps(options: {
  width: number;
  height: number;
  radius: number;
  bezelWidth: number;
  glassThickness: number;
  refractiveIndex: number;
  bezelType: BezelType;
  magnify?: boolean;
  dpr?: number;
}): LiquidGlassMaps {
  const {
    width,
    height,
    radius,
    bezelWidth,
    glassThickness,
    refractiveIndex,
    bezelType,
    magnify = false,
    dpr,
  } = options;

  const profile = calculateDisplacementProfile(
    glassThickness,
    bezelWidth,
    getSurfaceFn(bezelType),
    refractiveIndex,
  );

  const maxDisplacement = Math.max(...profile.map((v) => Math.abs(v))) || 1;

  const displacement = calculateDisplacementMap(
    width,
    height,
    width,
    height,
    radius,
    bezelWidth,
    100,
    profile,
    dpr,
  );

  const specular = calculateRefractionSpecular(
    width,
    height,
    radius,
    bezelWidth,
    Math.PI / 3,
    dpr,
  );

  const maps: LiquidGlassMaps = {
    displacementUrl: imageDataToUrl(displacement),
    specularUrl: imageDataToUrl(specular),
    maxDisplacement,
  };

  if (magnify) {
    const magnifying = calculateMagnifyingDisplacementMap(width, height, dpr);
    maps.magnifyingUrl = imageDataToUrl(magnifying);
  }

  return maps;
}
