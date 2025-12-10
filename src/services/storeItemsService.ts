import { supabase } from './supabase';

class StoreItemsService {
  private readonly BUCKET_NAME = 'store-item-images';

  async uploadItemImage(file: File, itemId?: string): Promise<string> {
    try {
      console.log('Starting store item image upload...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucketName: this.BUCKET_NAME
      });

      const fileExt = file.name.split('.').pop();
      const fileName = itemId 
        ? `${itemId}_${Date.now()}.${fileExt}`
        : `item_${Date.now()}.${fileExt}`;

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed');
      }

      console.log('Uploading to bucket:', this.BUCKET_NAME, 'with filename:', fileName);

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      if (!publicUrlData) {
        throw new Error('Failed to get public URL');
      }

      console.log('Public URL:', publicUrlData.publicUrl);
      
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading store item image:', error);
      throw error;
    }
  }

  async deleteItemImage(imageUrl: string): Promise<void> {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName]);

      if (error) {
        console.error('Failed to delete image:', error);
        throw error;
      }

      console.log('Image deleted successfully:', fileName);
    } catch (error) {
      console.error('Error deleting store item image:', error);
      throw error;
    }
  }
}

export const storeItemsService = new StoreItemsService();
