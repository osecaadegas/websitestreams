import { supabase, UserProfile } from './supabase';
import { twitchAuthService } from './twitchAuth';

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  email: string;
  profile_image_url: string;
  created_at: string;
}

class SupabaseAuthService {
  /**
   * Handles the complete OAuth flow with Twitch and Supabase
   */
  async handleTwitchCallback(tokenOrCode: string, state: string | null): Promise<UserProfile> {
    try {
      // First, complete Twitch OAuth
      const twitchUser = await twitchAuthService.handleCallback(tokenOrCode, state);
      
      // Create or update user in Supabase
      const userProfile = await this.createOrUpdateUser(twitchUser);
      
      // Store the session in Supabase
      await this.createUserSession(userProfile.id, twitchAuthService.getAccessToken()!);
      
      return userProfile;
    } catch (error) {
      console.error('Error in Twitch callback:', error);
      throw error;
    }
  }

  /**
   * Creates or updates a user profile in Supabase
   */
  private async createOrUpdateUser(twitchUser: TwitchUser): Promise<UserProfile> {
    const userProfile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> = {
      twitch_id: twitchUser.id,
      twitch_username: twitchUser.login,
      display_name: twitchUser.display_name,
      email: twitchUser.email,
      profile_image_url: twitchUser.profile_image_url,
      last_login: new Date().toISOString(),
      is_active: true,
    };

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('twitch_id', twitchUser.id)
      .single();

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...userProfile,
          updated_at: new Date().toISOString(),
        })
        .eq('twitch_id', twitchUser.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([userProfile])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  /**
   * Creates a new user session
   */
  private async createUserSession(userId: string, accessToken: string): Promise<void> {
    // First, deactivate any existing sessions for this user
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId);

    // Create new session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 4); // Twitch tokens typically expire in 4 hours

    const { error } = await supabase
      .from('user_sessions')
      .insert([{
        user_id: userId,
        twitch_access_token: accessToken,
        expires_at: expiresAt.toISOString(),
      }]);

    if (error) throw error;
  }

  /**
   * Gets user profile from Supabase by Twitch ID
   */
  async getUserProfile(twitchId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('twitch_id', twitchId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  /**
   * Updates user's last login time
   */
  async updateLastLogin(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Validates and refreshes user session
   */
  async validateSession(): Promise<UserProfile | null> {
    try {
      // Get current Twitch user
      const twitchUser = await twitchAuthService.getUserInfo();
      
      // Get user profile from Supabase
      const userProfile = await this.getUserProfile(twitchUser.id);
      
      if (userProfile) {
        // Update last login
        await this.updateLastLogin(userProfile.id);
        return userProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Session validation failed:', error);
      return null;
    }
  }

  /**
   * Logs out user from both Twitch and Supabase
   */
  async logout(): Promise<void> {
    try {
      // Get current access token
      const accessToken = twitchAuthService.getAccessToken();
      
      if (accessToken) {
        // Remove session from Supabase
        await supabase
          .from('user_sessions')
          .delete()
          .eq('twitch_access_token', accessToken);
      }
      
      // Clear local storage and revoke Twitch token
      localStorage.removeItem('twitch_access_token');
      await twitchAuthService.revokeToken();
      
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  /**
   * Updates user profile in Supabase
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Gets user analytics/stats
   */
  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    lastLogin: string;
    accountAge: number;
  }> {
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('created_at')
      .eq('user_id', userId);

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('created_at, last_login')
      .eq('id', userId)
      .single();

    if (sessionsError || profileError) {
      throw new Error('Failed to fetch user stats');
    }

    const accountCreated = new Date(profile.created_at);
    const now = new Date();
    const accountAge = Math.floor((now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));

    return {
      totalSessions: sessions?.length || 0,
      lastLogin: profile.last_login,
      accountAge,
    };
  }
}

export const supabaseAuthService = new SupabaseAuthService();