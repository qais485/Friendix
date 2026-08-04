import api from "./api";
import type {
  Profile,
  ProfileUpdate,
  AvatarUpdate,
  CoverPhotoUpdate,
  UsernameCheck,
  UsernameUpdate,
  UsernameResponse,
} from "@/types";

export const profileApi = {
  getMyProfile: () =>
    api.get<Profile>("/profile/me"),

  getPublicProfile: (username: string) =>
    api.get<Profile>(`/profile/user/${username}`),

  updateProfile: (data: ProfileUpdate) =>
    api.put<Profile>("/profile/me", data),

  updateAvatar: (data: AvatarUpdate) =>
    api.put<Profile>("/profile/me/avatar", data),

  updateCoverPhoto: (data: CoverPhotoUpdate) =>
    api.put<Profile>("/profile/me/cover", data),

  updateUsername: (data: UsernameUpdate) =>
    api.put<Profile>("/profile/me/username", data),

  checkUsername: (data: UsernameCheck, signal?: AbortSignal) =>
    api.post<UsernameResponse>("/profile/check-username", data, { signal }),

  searchUsers: (query: string, limit = 20) =>
    api.get<Profile[]>("/profile/search", {
      params: { q: query, limit },
    }),

  getExploreProfiles: (limit = 20, offset = 0) =>
    api.get<Profile[]>("/profile/explore", {
      params: { limit, offset },
    }),
};
