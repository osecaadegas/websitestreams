import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserRole } from '../types/roles';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types
export interface UserProfile {
  id: string;
  twitch_id: string;
  twitch_username: string;
  display_name: string;
  email: string;
  profile_image_url: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  last_login: string;
  is_active: boolean;
}

export interface UserSession {
  id: string;
  user_id: string;
  twitch_access_token: string;
  twitch_refresh_token?: string;
  expires_at: string;
  created_at: string;
}