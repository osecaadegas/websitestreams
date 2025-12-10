import { supabase } from './supabase';

export interface VideoHighlight {
  id: number;
  slot_number: number;
  title: string;
  description: string;
  url: string;
  duration: string;
  views: string;
  updated_at?: string;
}

export const videoHighlightsService = {
  // Get all video highlights
  async getVideoHighlights(): Promise<VideoHighlight[]> {
    try {
      const { data, error } = await supabase.rpc('get_video_highlights');
      
      if (error) {
        console.error('Error fetching video highlights:', error);
        throw error;
      }
      
      // If no data, return default highlights
      if (!data || data.length === 0) {
        return Array.from({ length: 12 }, (_, index) => ({
          id: index + 1,
          slot_number: index + 1,
          title: `Highlight ${index + 1}`,
          description: 'Amazing moment from stream',
          url: '',
          duration: '0:15',
          views: '1.2K'
        }));
      }
      
      // Ensure we have all 12 slots
      const highlights: VideoHighlight[] = [];
      for (let i = 1; i <= 12; i++) {
        const existing = data.find((h: any) => h.slot_number === i);
        if (existing) {
          highlights.push(existing);
        } else {
          highlights.push({
            id: i,
            slot_number: i,
            title: `Highlight ${i}`,
            description: 'Amazing moment from stream',
            url: '',
            duration: '0:15',
            views: '1.2K'
          });
        }
      }
      
      return highlights;
    } catch (error) {
      console.error('Error in getVideoHighlights:', error);
      throw error;
    }
  },

  // Update a single video highlight
  async updateVideoHighlight(
    slotNumber: number,
    title: string,
    description: string,
    url: string,
    duration: string = '0:15',
    views: string = '1.2K'
  ): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('upsert_video_highlight', {
        p_slot_number: slotNumber,
        p_title: title,
        p_description: description,
        p_url: url,
        p_duration: duration,
        p_views: views,
        p_updated_by: user.id
      });

      if (error) {
        console.error('Error updating video highlight:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateVideoHighlight:', error);
      throw error;
    }
  },

  // Batch update multiple video highlights
  async batchUpdateVideoHighlights(highlights: Omit<VideoHighlight, 'id' | 'updated_at'>[]): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('batch_update_video_highlights', {
        p_highlights: JSON.stringify(highlights),
        p_updated_by: user.id
      });

      if (error) {
        console.error('Error batch updating video highlights:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in batchUpdateVideoHighlights:', error);
      throw error;
    }
  },

  // Reset a video highlight to default
  async resetVideoHighlight(slotNumber: number): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('reset_video_highlight', {
        p_slot_number: slotNumber,
        p_updated_by: user.id
      });

      if (error) {
        console.error('Error resetting video highlight:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in resetVideoHighlight:', error);
      throw error;
    }
  }
};