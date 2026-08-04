export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  is_deactivated: boolean;
  created_at: string;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  total: number;
  has_more: boolean;
}

export interface BannedUser {
  id: string;
  user_id: string;
  banned_by_id: string | null;
  reason: string;
  expires_at: string | null;
  is_permanent: boolean;
  created_at: string;
  username?: string;
  email?: string;
  full_name?: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  entity_type: string;
  entity_id: string;
  reason: string;
  description: string | null;
  status: string;
  resolved_by_id: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  reporter_name?: string;
  reported_user_name?: string;
}

export interface ReportListResponse {
  reports: Report[];
  total: number;
  has_more: boolean;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  rollout_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  target_user_id: string | null;
  details_json: string | null;
  ip_address: string | null;
  created_at: string;
  admin_name?: string;
  target_user_name?: string;
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  total: number;
  has_more: boolean;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  reason: string;
  document_url: string | null;
  status: string;
  reviewed_by_id: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface VerificationRequestListResponse {
  requests: VerificationRequest[];
  total: number;
  has_more: boolean;
}

export interface AdminAnalytics {
  total_users: number;
  active_users: number;
  total_posts: number;
  total_comments: number;
  total_messages: number;
  pending_reports: number;
  pending_verifications: number;
  banned_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_posts_today: number;
}
