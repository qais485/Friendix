import * as React from "react";
import { cn } from "@/lib/utils";
import {
  getCloudinaryTransformedUrl,
  type CloudinaryPreset,
} from "@/lib/cloudinaryTransform";

type ImagePreset = CloudinaryPreset | "full";

const PRESET_DEFAULTS: Record<
  ImagePreset,
  { width: number; height: number; loading: "lazy" | "eager" }
> = {
  avatar: { width: 128, height: 128, loading: "lazy" },
  thumbnail: { width: 200, height: 200, loading: "lazy" },
  feed: { width: 940, height: 1175, loading: "lazy" },
  modal: { width: 1200, height: 900, loading: "eager" },
  story: { width: 1080, height: 1920, loading: "eager" },
  full: { width: 1200, height: 800, loading: "eager" },
};

export interface OptimizedImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "loading"> {
  src: string;
  alt: string;
  preset?: ImagePreset;
  eager?: boolean;
  circle?: boolean;
  fallback?: React.ReactNode;
  onImageError?: () => void;
}

const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      src,
      alt,
      preset = "feed",
      eager = false,
      circle = false,
      fallback,
      onImageError,
      className,
      width,
      height,
      ...props
    },
    ref,
  ) => {
    const [hasError, setHasError] = React.useState(false);

    const defaults = PRESET_DEFAULTS[preset];
    const imgWidth = (width as number) || defaults.width;
    const imgHeight = (height as number) || defaults.height;

    const resolvedSrc =
      preset === "full"
        ? src
        : getCloudinaryTransformedUrl(src, preset as CloudinaryPreset);

    const handleError = React.useCallback(() => {
      setHasError(true);
      onImageError?.();
    }, [onImageError]);

    if (hasError && fallback) {
      return <>{fallback}</>;
    }

    return (
      <img
        ref={ref}
        src={resolvedSrc}
        alt={alt}
        width={imgWidth}
        height={imgHeight}
        loading={eager ? "eager" : defaults.loading}
        decoding="async"
        className={cn(
          "object-cover",
          circle && "rounded-full",
          className,
        )}
        onError={handleError}
        {...props}
      />
    );
  },
);
OptimizedImage.displayName = "OptimizedImage";

export { OptimizedImage, type ImagePreset, PRESET_DEFAULTS };
