import { supabase } from './supabase';

// Types for slot database
export interface Slot {
  id: string;
  name: string;
  provider: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SlotInput {
  name: string;
  provider: string;
  image_url?: string;
  is_active?: boolean;
}

export interface SlotProvider {
  provider: string;
  slot_count: number;
}

export interface SlotFilters {
  search?: string;
  provider?: string;
  activeOnly?: boolean;
}

class SlotsService {
  // Get all slots with optional filtering
  async getSlots(filters: SlotFilters = {}): Promise<Slot[]> {
    try {
      const { data, error } = await supabase.rpc('get_slots', {
        search_query: filters.search || null,
        provider_filter: filters.provider || null,
        active_only: filters.activeOnly !== false // Default to true
      });

      if (error) {
        console.error('Error fetching slots:', error);
        throw new Error(`Failed to fetch slots: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSlots:', error);
      throw error;
    }
  }

  // Get unique providers with slot counts
  async getProviders(): Promise<SlotProvider[]> {
    try {
      const { data, error } = await supabase.rpc('get_slot_providers');

      if (error) {
        console.error('Error fetching providers:', error);
        throw new Error(`Failed to fetch providers: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProviders:', error);
      throw error;
    }
  }

  // Create or update a slot
  async upsertSlot(slot: SlotInput): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('upsert_slot', {
        slot_name: slot.name,
        slot_provider: slot.provider,
        slot_image_url: slot.image_url || null,
        slot_is_active: slot.is_active !== false
      });

      if (error) {
        console.error('Error upserting slot:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data };
    } catch (error) {
      console.error('Error in upsertSlot:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Delete a slot
  async deleteSlot(slotId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('delete_slot', {
        slot_id: slotId
      });

      if (error) {
        console.error('Error deleting slot:', error);
        return { success: false, error: error.message };
      }

      return { success: data === true };
    } catch (error) {
      console.error('Error in deleteSlot:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Toggle slot active status
  async toggleSlotStatus(slotId: string): Promise<{ success: boolean; newStatus?: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('toggle_slot_status', {
        slot_id: slotId
      });

      if (error) {
        console.error('Error toggling slot status:', error);
        return { success: false, error: error.message };
      }

      return { success: true, newStatus: data };
    } catch (error) {
      console.error('Error in toggleSlotStatus:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Bulk import slots from JavaScript array
  async bulkImportSlots(slots: Array<{ name: string; provider: string; image: string }>): Promise<{ success: boolean; insertedCount?: number; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('bulk_insert_slots', {
        slots_data: JSON.stringify(slots)
      });

      if (error) {
        console.error('Error bulk importing slots:', error);
        return { success: false, error: error.message };
      }

      return { success: true, insertedCount: data };
    } catch (error) {
      console.error('Error in bulkImportSlots:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Create empty slot for forms
  createEmptySlot(): SlotInput {
    return {
      name: '',
      provider: '',
      image_url: '',
      is_active: true
    };
  }

  // Validate slot data
  validateSlot(slot: SlotInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!slot.name || slot.name.trim().length === 0) {
      errors.push('Slot name is required');
    }

    if (!slot.provider || slot.provider.trim().length === 0) {
      errors.push('Provider is required');
    }

    if (slot.image_url && !this.isValidUrl(slot.image_url)) {
      errors.push('Invalid image URL format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Helper function to validate URLs
  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Get slots statistics
  async getSlotStats(): Promise<{
    totalSlots: number;
    activeSlots: number;
    totalProviders: number;
    topProviders: Array<{ provider: string; count: number }>;
  }> {
    try {
      const [allSlots, providers] = await Promise.all([
        this.getSlots({ activeOnly: false }),
        this.getProviders()
      ]);

      const activeSlots = allSlots.filter(slot => slot.is_active).length;
      const topProviders = providers
        .sort((a, b) => b.slot_count - a.slot_count)
        .slice(0, 5)
        .map(p => ({ provider: p.provider, count: p.slot_count }));

      return {
        totalSlots: allSlots.length,
        activeSlots,
        totalProviders: providers.length,
        topProviders
      };
    } catch (error) {
      console.error('Error getting slot stats:', error);
      return {
        totalSlots: 0,
        activeSlots: 0,
        totalProviders: 0,
        topProviders: []
      };
    }
  }
}

export const slotsService = new SlotsService();