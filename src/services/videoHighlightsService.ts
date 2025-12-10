import { supabase } from './supabase';

export interface VideoHighlight {
  id: number;
  slot_number: number;
  title: string;
  description: string;
  url: string;
  video_file_path?: string;
  video_file_name?: string;
  file_size?: number;
  mime_type?: string;
  is_uploaded_file: boolean;
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
          is_uploaded_file: false,
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
            is_uploaded_file: false,
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
    userId: string,
    duration: string = '0:15',
    views: string = '1.2K'
  ): Promise<boolean> {
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('upsert_video_highlight', {
        p_slot_number: slotNumber,
        p_title: title,
        p_description: description,
        p_url: url,
        p_updated_by: userId,
        p_duration: duration,
        p_views: views
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
  async batchUpdateVideoHighlights(highlights: Omit<VideoHighlight, 'id' | 'updated_at'>[], userId: string): Promise<boolean> {
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('batch_update_video_highlights', {
        p_highlights: highlights,
        p_updated_by: userId
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
  async resetVideoHighlight(slotNumber: number, userId: string): Promise<boolean> {
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('reset_video_highlight', {
        p_slot_number: slotNumber,
        p_updated_by: userId
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
  },

  // Upload video file and update highlight
  async uploadVideoFile(
    slotNumber: number,
    file: File,
    title: string,
    description: string,
    userId: string,
    duration: string = '0:15',
    views: string = '1.2K'
  ): Promise<{ success: boolean; filePath?: string }> {
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Validate file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload MP4, WebM, OGG, or MOV files.');
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 100MB.');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `highlight_${slotNumber}_${Date.now()}.${fileExt}`;
      const filePath = `video_highlights/${userId}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('video-highlights')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload video file');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('video-highlights')
        .getPublicUrl(filePath);

      // Update database with file info
      const { data, error } = await supabase.rpc('upsert_video_highlight', {
        p_slot_number: slotNumber,
        p_title: title,
        p_description: description,
        p_url: '', // Clear URL when uploading file
        p_updated_by: userId,
        p_video_file_path: publicUrl,
        p_video_file_name: file.name,
        p_file_size: file.size,
        p_mime_type: file.type,
        p_is_uploaded_file: true,
        p_duration: duration,
        p_views: views
      });

      if (error) {
        console.error('Database update error:', error);
        // Try to clean up uploaded file
        await supabase.storage.from('video-highlights').remove([filePath]);
        throw error;
      }

      return { success: true, filePath: publicUrl };
    } catch (error) {
      console.error('Error in uploadVideoFile:', error);
      throw error;
    }
  },

  // Delete uploaded video file
  async deleteVideoFile(slotNumber: number, userId: string): Promise<boolean> {
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Get current highlight to find file path
      const highlights = await this.getVideoHighlights();
      const highlight = highlights.find(h => h.slot_number === slotNumber);
      
      if (highlight?.is_uploaded_file && highlight.video_file_path) {
        // Extract file path from public URL
        const url = new URL(highlight.video_file_path);
        const filePath = url.pathname.split('/video-highlights/')[1];
        
        if (filePath) {
          // Delete file from storage
          await supabase.storage.from('video-highlights').remove([filePath]);
        }
      }

      // Reset highlight to defaults
      return await this.resetVideoHighlight(slotNumber, userId);
    } catch (error) {
      console.error('Error in deleteVideoFile:', error);
      throw error;
    }
  }
};