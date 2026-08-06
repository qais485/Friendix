import { useState } from "react";
import { getCloudinaryTransformedUrl } from "@/lib/cloudinaryTransform";

interface AdaptiveImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function AdaptiveImage({ src, alt, className }: AdaptiveImageProps) {
  const [aspect, setAspect] = useState<number | null>(null);

  return (
    <div
      className={className}
      style={aspect ? { aspectRatio: `1 / ${aspect}`, height: "auto", maxHeight: "85vh" } : { height: "100%" }}
    >
      <img
        src={getCloudinaryTransformedUrl(src, "modal")}
        alt={alt}
        className="h-full w-full object-contain"
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalHeight > 0) {
            setAspect(img.naturalHeight / img.naturalWidth);
          }
        }}
      />
    </div>
  );
}
