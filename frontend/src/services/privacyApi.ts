import api from "./api";
import type {
  PrivacySetting,
  PrivacySettingUpdate,
  BlockUserRequest,
  BlockedUser,
} from "@/types";

export const privacyApi = {
  getPrivacySettings: () =>
    api.get<PrivacySetting>("/privacy/settings"),

  updatePrivacySettings: (data: PrivacySettingUpdate) =>
    api.put<PrivacySetting>("/privacy/settings", data),

  blockUser: (data: BlockUserRequest) =>
    api.post("/privacy/block", data),

  unblockUser: (blockedUserId: string) =>
    api.delete(`/privacy/block/${blockedUserId}`),

  getBlockedUsers: () =>
    api.get<BlockedUser[]>("/privacy/blocked"),

  muteUser: (data: BlockUserRequest) =>
    api.post("/privacy/mute", data),

  unmuteUser: (mutedUserId: string) =>
    api.delete(`/privacy/mute/${mutedUserId}`),

  getMutedUsers: () =>
    api.get<BlockedUser[]>("/privacy/muted"),

  restrictUser: (data: BlockUserRequest) =>
    api.post("/privacy/restrict", data),

  unrestrictUser: (restrictedUserId: string) =>
    api.delete(`/privacy/restrict/${restrictedUserId}`),

  getRestrictedUsers: () =>
    api.get<BlockedUser[]>("/privacy/restricted"),
};
