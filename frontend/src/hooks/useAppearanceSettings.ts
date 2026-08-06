import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/services/api";

export type PostCardBarMode = "glass" | "solid" | "none";

export interface PostCardBarAppearance {
  mode: PostCardBarMode;
  color: string;
}

export interface AppearanceSettings {
  header: PostCardBarAppearance;
  footer: PostCardBarAppearance;
}

export const APPEARANCE_QUERY_KEY = ["appearance-settings"] as const;

const VALID_MODES: PostCardBarMode[] = ["glass", "solid", "none"];

function parseMode(value: string | undefined): PostCardBarMode {
  return value && VALID_MODES.includes(value as PostCardBarMode) ? (value as PostCardBarMode) : "glass";
}

function parseSection(
  data: Record<string, string>,
  prefix: "header" | "footer"
): PostCardBarAppearance {
  return {
    mode: parseMode(data[`postcard_${prefix}_mode`]),
    color: data[`postcard_${prefix}_color`] || "#000000",
  };
}

export function useAppearanceSettings() {
  return useQuery({
    queryKey: APPEARANCE_QUERY_KEY,
    queryFn: () => settingsApi.getAppearance().then((r) => r.data),
    select: (data): AppearanceSettings => ({
      header: parseSection(data, "header"),
      footer: parseSection(data, "footer"),
    }),
    placeholderData: {},
  });
}
