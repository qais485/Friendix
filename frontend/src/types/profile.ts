export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  cover_photo_url: string | null;
  bio: string | null;
  website: string | null;
  gender: string | null;
  birthday: string | null;
  relationship_status: string | null;
  education: string | null;
  work: string | null;
  location: string | null;
  languages: string | null;
  interests: string | null;
  profile_theme: string;
  is_verified: boolean;
  role: string;
  created_at: string;
}

export interface ProfileUpdate {
  full_name?: string | null;
  username?: string | null;
  bio?: string | null;
  website?: string | null;
  gender?: string | null;
  birthday?: string | null;
  relationship_status?: string | null;
  education?: string | null;
  work?: string | null;
  location?: string | null;
  languages?: string | null;
  interests?: string | null;
  profile_theme?: string | null;
}

export interface AvatarUpdate {
  avatar_url: string;
}

export interface CoverPhotoUpdate {
  cover_photo_url: string;
}

export interface UsernameCheck {
  username: string;
}

export interface UsernameUpdate {
  username: string;
}

export interface UsernameResponse {
  available: boolean;
  username: string;
}
