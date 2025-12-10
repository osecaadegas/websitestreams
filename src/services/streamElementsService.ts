import { supabase } from '../lib/supabaseClient';

interface StreamElementsUser {
  username: string;
  points: number;
  rank: number;
  watchtime: number;
}

interface StreamElementsConfig {
  channelId: string;
  jwtToken: string;
}

class StreamElementsService {
  private baseUrl = 'https://api.streamelements.com/kappa/v2';
  
  // Get configuration from Supabase
  private async getConfig(): Promise<StreamElementsConfig | null> {
    try {
      const { data, error } = await supabase
        .from('streamelements_config')
        .select('channel_id, jwt_token')
        .single();
      
      if (error) throw error;
      return {
        channelId: data.channel_id,
        jwtToken: data.jwt_token
      };
    } catch (error) {
      console.error('Failed to get StreamElements config:', error);
      return null;
    }
  }

  // Get user points
  async getUserPoints(username: string): Promise<number | null> {
    try {
      const config = await this.getConfig();
      if (!config) return null;

      const response = await fetch(
        `${this.baseUrl}/points/${config.channelId}/${username}`,
        {
          headers: {
            'Authorization': `Bearer ${config.jwtToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch user points');
      
      const data = await response.json();
      return data.points || 0;
    } catch (error) {
      console.error('Error fetching user points:', error);
      return null;
    }
  }

  // Get top users by points (leaderboard)
  async getLeaderboard(limit: number = 10): Promise<StreamElementsUser[]> {
    try {
      const config = await this.getConfig();
      if (!config) return [];

      const response = await fetch(
        `${this.baseUrl}/points/${config.channelId}/top?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${config.jwtToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  // Add points to user
  async addPoints(username: string, amount: number): Promise<boolean> {
    try {
      const config = await this.getConfig();
      if (!config) return false;

      const response = await fetch(
        `${this.baseUrl}/points/${config.channelId}/${username}/${amount}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${config.jwtToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error adding points:', error);
      return false;
    }
  }

  // Remove points from user
  async removePoints(username: string, amount: number): Promise<boolean> {
    try {
      const config = await this.getConfig();
      if (!config) return false;

      const response = await fetch(
        `${this.baseUrl}/points/${config.channelId}/${username}/${-amount}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${config.jwtToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error removing points:', error);
      return false;
    }
  }

  // Set user points to specific amount
  async setPoints(username: string, amount: number): Promise<boolean> {
    try {
      const config = await this.getConfig();
      if (!config) return false;

      const response = await fetch(
        `${this.baseUrl}/points/${config.channelId}/${username}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${config.jwtToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ points: amount })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error setting points:', error);
      return false;
    }
  }

  // Get all users with points
  async getAllUsers(): Promise<StreamElementsUser[]> {
    try {
      const config = await this.getConfig();
      if (!config) return [];

      const response = await fetch(
        `${this.baseUrl}/points/${config.channelId}`,
        {
          headers: {
            'Authorization': `Bearer ${config.jwtToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
}

export const streamElementsService = new StreamElementsService();
export type { StreamElementsUser, StreamElementsConfig };
