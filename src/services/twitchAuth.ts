import axios from 'axios';

const TWITCH_CLIENT_ID = process.env.REACT_APP_TWITCH_CLIENT_ID;
const TWITCH_REDIRECT_URI = process.env.REACT_APP_TWITCH_REDIRECT_URI;
const TWITCH_SCOPES = process.env.REACT_APP_TWITCH_SCOPES || 'user:read:email';

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  email: string;
  profile_image_url: string;
  created_at: string;
}

interface TwitchTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string[];
  token_type: string;
}

class TwitchAuthService {
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  initiateLogin(): void {
    if (!TWITCH_CLIENT_ID || !TWITCH_REDIRECT_URI) {
      throw new Error('Twitch OAuth configuration is missing');
    }

    const state = this.generateState();
    localStorage.setItem('oauth_state', state);

    const authUrl = new URL('https://id.twitch.tv/oauth2/authorize');
    authUrl.searchParams.append('client_id', TWITCH_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', TWITCH_REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('scope', TWITCH_SCOPES);
    authUrl.searchParams.append('state', state);

    window.location.href = authUrl.toString();
  }

  async handleCallback(token: string, state: string | null): Promise<TwitchUser> {
    try {
      // Verify state parameter (optional for now)
      const storedState = localStorage.getItem('oauth_state');
      if (storedState) {
        localStorage.removeItem('oauth_state');
      }

      // Store the access token directly (implicit flow)
      localStorage.setItem('twitch_access_token', token);
      
      // Get user information
      const userInfo = await this.getUserInfo();
      
      return userInfo;
    } catch (error) {
      console.error('Error handling callback:', error);
      throw error;
    }
  }

  private async exchangeCodeForToken(code: string): Promise<TwitchTokenResponse> {
    try {
      const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
          client_id: TWITCH_CLIENT_ID,
          client_secret: '', // This won't work without a client secret - we need implicit flow
          code,
          grant_type: 'authorization_code',
          redirect_uri: TWITCH_REDIRECT_URI,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to exchange authorization code for access token');
    }
  }

  async getUserInfo(): Promise<TwitchUser> {
    const token = localStorage.getItem('twitch_access_token');
    if (!token) {
      throw new Error('No access token found');
    }

    try {
      const response = await axios.get('https://api.twitch.tv/helix/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Client-Id': TWITCH_CLIENT_ID!,
        },
      });

      if (response.data.data && response.data.data.length > 0) {
        return response.data.data[0];
      } else {
        throw new Error('No user data received');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      // If token is invalid, remove it
      localStorage.removeItem('twitch_access_token');
      throw new Error('Failed to fetch user information');
    }
  }

  async validateToken(): Promise<boolean> {
    const token = localStorage.getItem('twitch_access_token');
    if (!token) {
      return false;
    }

    try {
      const response = await axios.get('https://id.twitch.tv/oauth2/validate', {
        headers: {
          'Authorization': `OAuth ${token}`,
        },
      });

      return response.status === 200;
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('twitch_access_token');
      return false;
    }
  }

  async revokeToken(): Promise<void> {
    const token = localStorage.getItem('twitch_access_token');
    if (!token) {
      return;
    }

    try {
      await axios.post('https://id.twitch.tv/oauth2/revoke', {
        client_id: TWITCH_CLIENT_ID,
        token,
      });
    } catch (error) {
      console.error('Error revoking token:', error);
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('twitch_access_token');
  }
}

export const twitchAuthService = new TwitchAuthService();