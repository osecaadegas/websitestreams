import { supabase } from './supabase';

export interface PartnerOffer {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  image_file_path?: string;
  min_deposit?: number;
  vpn_friendly: boolean;
  bonus?: string;
  cashback?: string;
  free_spins?: string;
  deposit_methods?: string[];
  withdrawal_methods?: string[];
  terms_conditions?: string;
  max_bonus?: number;
  wagering_requirements?: string;
  country_restrictions?: string[];
  affiliate_link?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PartnerOfferInput {
  id?: string;
  title: string;
  description: string;
  image_url?: string;
  image_file_path?: string;
  min_deposit?: number;
  vpn_friendly: boolean;
  bonus?: string;
  cashback?: string;
  free_spins?: string;
  deposit_methods?: string[];
  withdrawal_methods?: string[];
  terms_conditions?: string;
  max_bonus?: number;
  wagering_requirements?: string;
  country_restrictions?: string[];
  affiliate_link?: string;
  is_featured: boolean;
  is_active: boolean;
}

class PartnerOffersService {
  private readonly BUCKET_NAME = 'partner-offer-images';

  // Ensure bucket exists
  private async ensureBucketExists(): Promise<void> {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        console.log('Creating storage bucket:', this.BUCKET_NAME);
        const { error } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (error) {
          console.error('Failed to create bucket:', error);
          throw new Error(`Cannot create storage bucket: ${error.message}`);
        }
        
        console.log('Storage bucket created successfully');
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      throw error;
    }
  }

  async getPartnerOffers(includeInactive: boolean = false): Promise<PartnerOffer[]> {
    try {
      const { data, error } = await supabase.rpc('get_partner_offers', {
        p_include_inactive: includeInactive
      });

      if (error) {
        console.error('Error fetching partner offers:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Service error fetching partner offers:', error);
      throw error;
    }
  }

  async upsertPartnerOffer(offer: PartnerOfferInput): Promise<PartnerOffer> {
    try {
      const { data, error } = await supabase.rpc('upsert_partner_offer', {
        p_title: offer.title,
        p_description: offer.description,
        p_id: offer.id || null,
        p_image_url: offer.image_url || null,
        p_image_file_path: offer.image_file_path || null,
        p_min_deposit: offer.min_deposit || null,
        p_vpn_friendly: offer.vpn_friendly,
        p_bonus: offer.bonus || null,
        p_cashback: offer.cashback || null,
        p_free_spins: offer.free_spins || null,
        p_deposit_methods: offer.deposit_methods || null,
        p_withdrawal_methods: offer.withdrawal_methods || null,
        p_terms_conditions: offer.terms_conditions || null,
        p_max_bonus: offer.max_bonus || null,
        p_wagering_requirements: offer.wagering_requirements || null,
        p_country_restrictions: offer.country_restrictions || null,
        p_affiliate_link: offer.affiliate_link || null,
        p_is_featured: offer.is_featured,
        p_is_active: offer.is_active
      });

      if (error) {
        console.error('Error upserting partner offer:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Service error upserting partner offer:', error);
      throw error;
    }
  }

  async deletePartnerOffer(offerId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('delete_partner_offer', {
        p_offer_id: offerId
      });

      if (error) {
        console.error('Error deleting partner offer:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Service error deleting partner offer:', error);
      throw error;
    }
  }

  async togglePartnerOfferStatus(offerId: string): Promise<PartnerOffer> {
    try {
      const { data, error } = await supabase.rpc('toggle_partner_offer_status', {
        p_offer_id: offerId
      });

      if (error) {
        console.error('Error toggling partner offer status:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Service error toggling partner offer status:', error);
      throw error;
    }
  }

  async uploadOfferImage(file: File, offerId?: string): Promise<string> {
    try {
      console.log('Starting image upload...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucketName: this.BUCKET_NAME
      });

      const fileExt = file.name.split('.').pop();
      const fileName = offerId 
        ? `${offerId}_${Date.now()}.${fileExt}`
        : `offer_${Date.now()}.${fileExt}`;

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

      // Ensure bucket exists
      await this.ensureBucketExists();

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        console.error('Error details:', {
          message: error.message,
          error: error
        });
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrlData.publicUrl);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Service error uploading offer image:', error);
      throw error;
    }
  }

  async deleteOfferImage(filePath: string): Promise<boolean> {
    try {
      // Extract filename from the full URL
      const fileName = filePath.split('/').pop();
      if (!fileName) {
        throw new Error('Invalid file path');
      }

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName]);

      if (error) {
        console.error('Storage delete error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Service error deleting offer image:', error);
      throw error;
    }
  }

  // Utility method to check if user has partner management permissions
  async hasPartnerManagementPermission(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking permissions:', error);
        return false;
      }

      return data?.role === 'admin' || data?.role === 'superadmin';
    } catch (error) {
      console.error('Service error checking permissions:', error);
      return false;
    }
  }

  // Test bucket access
  async testBucketAccess(): Promise<{ success: boolean; message: string }> {
    try {
      await this.ensureBucketExists();
      
      // Try to list files in bucket
      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).list();
      
      if (error) {
        return { success: false, message: `Bucket access failed: ${error.message}` };
      }
      
      return { success: true, message: `Bucket '${this.BUCKET_NAME}' is accessible. Contains ${data?.length || 0} files.` };
    } catch (error) {
      return { success: false, message: `Bucket test failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  // Helper method to create empty offer template
  createEmptyOffer(): PartnerOfferInput {
    return {
      title: '',
      description: '',
      vpn_friendly: false,
      is_featured: false,
      is_active: true,
      deposit_methods: [],
      withdrawal_methods: [],
      country_restrictions: []
    };
  }

  // Helper method to validate offer data
  validateOffer(offer: PartnerOfferInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!offer.title.trim()) {
      errors.push('Title is required');
    }

    if (!offer.description.trim()) {
      errors.push('Description is required');
    }

    if (offer.min_deposit && offer.min_deposit <= 0) {
      errors.push('Minimum deposit must be greater than 0');
    }

    if (offer.max_bonus && offer.max_bonus <= 0) {
      errors.push('Maximum bonus must be greater than 0');
    }

    if (offer.affiliate_link && !this.isValidUrl(offer.affiliate_link)) {
      errors.push('Affiliate link must be a valid URL');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
}

export const partnerOffersService = new PartnerOffersService();