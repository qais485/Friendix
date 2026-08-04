export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  role: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Device {
  id: string;
  device_name: string;
  device_type: string;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  last_active: string | null;
  is_active: boolean;
}

export interface LoginHistory {
  id: string;
  ip_address: string | null;
  device_info: string | null;
  location: string | null;
  is_successful: boolean;
  created_at: string;
}
