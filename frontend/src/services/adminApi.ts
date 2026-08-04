import api from "./api";
import type {
  AdminUserListResponse,
  AdminUser,
  BannedUser,
  ReportListResponse,
  Report,
  FeatureFlag,
  AuditLogListResponse,
  SystemSetting,
  VerificationRequestListResponse,
  VerificationRequest,
  AdminAnalytics,
} from "@/types";

export const adminApi = {
  getAnalytics: () =>
    api.get<AdminAnalytics>("/admin/analytics"),

  getUsers: (search?: string, role?: string, cursor?: string, limit = 20) =>
    api.get<AdminUserListResponse>("/admin/users", {
      params: { search, role, cursor, limit },
    }),

  updateUserRole: (userId: string, role: string) =>
    api.put<AdminUser>(`/admin/users/${userId}/role`, { role }),

  toggleUserActive: (userId: string, isActive: boolean) =>
    api.put<AdminUser>(`/admin/users/${userId}/active`, { is_active: isActive }),

  banUser: (userId: string, reason: string, expiresAt?: string, isPermanent = false) =>
    api.post<BannedUser>(`/admin/users/${userId}/ban`, {
      reason,
      expires_at: expiresAt,
      is_permanent: isPermanent,
    }),

  getBannedUsers: (cursor?: string, limit = 20) =>
    api.get<BannedUser[]>("/admin/banned", { params: { cursor, limit } }),

  unbanUser: (banId: string) =>
    api.delete(`/admin/banned/${banId}`),

  getReports: (status?: string, cursor?: string, limit = 20) =>
    api.get<ReportListResponse>("/admin/reports", {
      params: { status, cursor, limit },
    }),

  resolveReport: (reportId: string, status: string, resolutionNotes?: string) =>
    api.put<Report>(`/admin/reports/${reportId}/resolve`, {
      status,
      resolution_notes: resolutionNotes,
    }),

  getFeatureFlags: () =>
    api.get<FeatureFlag[]>("/admin/feature-flags"),

  createFeatureFlag: (data: { key: string; name: string; description?: string; is_enabled?: boolean; rollout_percentage?: number }) =>
    api.post<FeatureFlag>("/admin/feature-flags", data),

  updateFeatureFlag: (flagId: string, data: Partial<FeatureFlag>) =>
    api.put<FeatureFlag>(`/admin/feature-flags/${flagId}`, data),

  deleteFeatureFlag: (flagId: string) =>
    api.delete(`/admin/feature-flags/${flagId}`),

  getAuditLogs: (action?: string, cursor?: string, limit = 20) =>
    api.get<AuditLogListResponse>("/admin/audit-logs", {
      params: { action, cursor, limit },
    }),

  getSystemSettings: (category?: string) =>
    api.get<SystemSetting[]>("/admin/settings", { params: { category } }),

  createSystemSetting: (data: { key: string; value: string; description?: string; category?: string }) =>
    api.post<SystemSetting>("/admin/settings", data),

  updateSystemSetting: (key: string, data: { value?: string; description?: string; category?: string }) =>
    api.put<SystemSetting>(`/admin/settings/${key}`, data),

  deleteSystemSetting: (key: string) =>
    api.delete(`/admin/settings/${key}`),

  getVerificationRequests: (status?: string, cursor?: string, limit = 20) =>
    api.get<VerificationRequestListResponse>("/admin/verifications", {
      params: { status, cursor, limit },
    }),

  reviewVerificationRequest: (requestId: string, status: string, reviewNotes?: string) =>
    api.put<VerificationRequest>(`/admin/verifications/${requestId}/review`, {
      status,
      review_notes: reviewNotes,
    }),
};
