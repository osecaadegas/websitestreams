import { supabase } from './supabase';

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
  
  // Get StreamElements configuration from environment variables
  private getConfig(): StreamElementsConfig | null {
    const channelId = process.env.REACT_APP_SE_CHANNEL_ID;
    const jwtToken = process.env.REACT_APP_SE_JWT_TOKEN;
    
    console.log('Checking SE config:', {
      channelId: channelId ? `${channelId.substring(0, 10)}...` : 'NOT FOUND',
      jwtToken: jwtToken ? 'FOUND' : 'NOT FOUND'
    });
    
    if (!channelId || !jwtToken) {
      console.error('StreamElements credentials not configured in environment variables');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.startsWith('REACT_APP_')));
      return null;
    }
    
    return {
      channelId,
      jwtToken
    };
  }

  // Get user points
  async getUserPoints(username: string): Promise<number | null> {
    try {
      const config = this.getConfig();
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

  // Sync user's StreamElements points to our database
  async syncUserPoints(username: string, userId: string): Promise<boolean> {
    try {
      const config = this.getConfig();
      if (!config) return false;

      // Try direct user endpoint first
      let response = await fetch(
        `${this.baseUrl}/points/${config.channelId}/${username}`,
        {
          headers: {
            'Authorization': `Bearer ${config.jwtToken}`,
            'Accept': 'application/json'
          }
        }
      );

      let data;

      // If 404, try fetching all users and finding the user
      if (!response.ok && response.status === 404) {
        console.log('Direct user fetch failed, trying to get from all users list...');
        response = await fetch(
          `${this.baseUrl}/points/${config.channelId}/top?limit=1000`,
          {
            headers: {
              'Authorization': `Bearer ${config.jwtToken}`,
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          console.error('Failed to fetch users from StreamElements:', response.status);
          return false;
        }

        const allUsersData = await response.json();
        console.log('All users data:', allUsersData);
        console.log('Looking for username:', username);
        
        // Find the user in the list
        const user = allUsersData?.users?.find((u: any) => 
          u.username?.toLowerCase() === username.toLowerCase()
        );

        if (!user) {
          console.error(`User ${username} not found in StreamElements`);
          console.log('Available usernames:', allUsersData?.users?.map((u: any) => u.username).slice(0, 10));
          return false;
        }

        data = user;
      } else if (!response.ok) {
        console.error('Failed to fetch user points from StreamElements:', response.status);
        return false;
      } else {
        data = await response.json();
      }

      console.log('User points data:', data);
      
      // Update in Supabase
      const { error } = await supabase
        .from('user_points')
        .upsert({
          user_id: userId,
          username: username,
          points: data.points || 0,
          points_alltime: data.pointsAlltime || 0,
          rank: data.rank || 0,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating user points:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error syncing user points:', error);
      return false;
    }
  }

  // Get top users by points (leaderboard) from our database
  async getLeaderboard(limit: number = 10): Promise<StreamElementsUser[]> {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('username, points, points_alltime, rank')
        .order('points', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }

      return (data || []).map((user, index) => ({
        username: user.username,
        points: user.points,
        rank: index + 1,
        watchtime: 0
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  // Add points to user
  async addPoints(username: string, amount: number): Promise<boolean> {
    try {
      const config = this.getConfig();
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
      const config = this.getConfig();
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
      const config = this.getConfig();
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
      const config = this.getConfig();
      if (!config) return [];

      const response = await fetch(
        `${this.baseUrl}/points/${config.channelId}/top?limit=1000`,
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
