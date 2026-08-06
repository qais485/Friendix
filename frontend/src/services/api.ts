import axios from "axios";
import type { User, TokenResponse, Device, LoginHistory } from "@/types";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/v1`
    : "/api/v1",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post("/api/v1/auth/refresh", null, {
            params: { refresh_token: refreshToken },
          });
          if (data?.access_token) localStorage.setItem("access_token", data.access_token);
          if (data?.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return apiClient(originalRequest);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  googleLogin: (credential: string) =>
    apiClient.post<TokenResponse>("/auth/google", { credential }),

  logout: (refreshToken: string) =>
    apiClient.post("/auth/logout", null, { params: { refresh_token: refreshToken } }),

  logoutAll: () =>
    apiClient.post("/auth/logout-all"),

  getDevices: () =>
    apiClient.get<Device[]>("/auth/devices"),

  revokeDevice: (deviceId: string) =>
    apiClient.delete(`/auth/devices/${deviceId}`),

  getLoginHistory: (limit = 50) =>
    apiClient.get<LoginHistory[]>("/auth/login-history", { params: { limit } }),

  deleteAccount: () =>
    apiClient.delete("/auth/delete", { data: { confirmation: "DELETE" } }),

  getCurrentUser: () =>
    apiClient.get<User>("/auth/me"),
};

export const settingsApi = {
  getAppearance: () =>
    apiClient.get<Record<string, string>>("/settings"),
};

export default apiClient;
