export type CloudinaryPreset =
  | "avatar"
  | "thumbnail"
  | "feed"
  | "modal"
  | "story";

interface PresetConfig {
  width?: number;
  height?: number;
  crop: string;
  gravity?: string;
  sizes: string;
}

const PRESETS: Record<CloudinaryPreset, PresetConfig> = {
  avatar: { width: 128, height: 128, crop: "fill", gravity: "face", sizes: "48px" },
  thumbnail: { width: 200, height: 200, crop: "limit", sizes: "(max-width: 640px) 50vw, 200px" },
  feed: { width: 940, height: 1175, crop: "limit", sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 470px" },
  modal: { width: 1200, crop: "limit", sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 960px" },
  story: { width: 1080, height: 1920, crop: "limit", sizes: "100vw" },
};

const SRC_SET_WIDTHS = [320, 480, 640, 768, 960, 1280];

function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com") || url.includes("cloudinary.com");
}

function extractUploadSegment(url: string): { base: string; after: string } | null {
  const uploadIdx = url.indexOf("/upload/");
  if (uploadIdx === -1) return null;
  const base = url.substring(0, uploadIdx + 8);
  const after = url.substring(uploadIdx + 8);
  return { base, after };
}

export function getCloudinaryTransformedUrl(
  url: string,
  preset: CloudinaryPreset = "feed",
): string {
  if (!url || !isCloudinaryUrl(url)) return url;

  const seg = extractUploadSegment(url);
  if (!seg) return url;

  const { base, after } = seg;
  const config = PRESETS[preset];

  const resize: string[] = [];
  if (config.width) resize.push(`w_${config.width}`);
  if (config.height) resize.push(`h_${config.height}`);
  resize.push(`c_${config.crop}`);
  if (config.gravity) resize.push(`g_${config.gravity}`);

  return `${base}${resize.join(",")}/q_auto/f_auto/fl_immutable_cache/${after}`;
}

export function getCloudinaryOriginalUrl(url: string): string {
  if (!url || !isCloudinaryUrl(url)) return url;
  const seg = extractUploadSegment(url);
  if (!seg) return url;
  return `${seg.base}${seg.after}`;
}

export function getVideoPosterUrl(videoUrl: string | null | undefined): string | undefined {
  if (!videoUrl) return undefined;
  return getCloudinaryTransformedUrl(videoUrl, "thumbnail");
}

export function getCloudinaryLqipUrl(url: string): string | null {
  if (!url || !isCloudinaryUrl(url)) return null;

  const seg = extractUploadSegment(url);
  if (!seg) return null;

  const { base, after } = seg;
  return `${base}w_20,h_20,c_fill,q_20,e_blur:500,f_jpg/${after}`;
}

export function getCloudinarySrcSet(
  url: string,
  preset: CloudinaryPreset = "feed",
): string {
  if (!url || !isCloudinaryUrl(url)) return "";

  const seg = extractUploadSegment(url);
  if (!seg) return "";

  const { base, after } = seg;
  const config = PRESETS[preset];
  const maxWidth = config.width ?? 940;

  const entries = SRC_SET_WIDTHS
    .filter((w) => w <= maxWidth)
    .map((w) => {
      const resize: string[] = [`w_${w}`, `c_${config.crop}`];
      if (config.gravity) resize.push(`g_${config.gravity}`);
      return `${base}${resize.join(",")}/q_auto/f_auto/fl_immutable_cache/${after} ${w}w`;
    });

  if (entries.length === 0) {
    return `${getCloudinaryTransformedUrl(url, preset)} ${maxWidth}w`;
  }

  return entries.join(", ");
}

export function getCloudinarySizes(preset: CloudinaryPreset): string {
  return PRESETS[preset].sizes;
}
