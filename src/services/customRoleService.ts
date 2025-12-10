import { supabase } from './supabase';
import { UserRole } from '../types/roles';

export interface CustomRole {
  id: string;
  role_name: string;
  display_name: string;
  description: string;
  permissions: CustomRolePermissions;
  color: string;
  icon: string;
  created_by: string;
  creator_name: string;
  created_at: string;
  is_active: boolean;
}

export interface CustomRolePermissions {
  canManageUsers?: boolean;
  canManageRoles?: boolean;
  canManageContent?: boolean;
  canManageSlots?: boolean;
  canModerate?: boolean;
  canAccessPremiumFeatures?: boolean;
  canViewAnalytics?: boolean;
  canManagePartners?: boolean;
  // Custom permissions can be added dynamically
  [key: string]: boolean | undefined;
}

export interface CreateCustomRoleData {
  roleName: string;
  displayName: string;
  description: string;
  permissions: CustomRolePermissions;
  color?: string;
  icon?: string;
}

export class CustomRoleService {
  /**
   * Create a new custom role
   */
  async createCustomRole(
    roleData: CreateCustomRoleData,
    createdBy: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_custom_role', {
        p_role_name: roleData.roleName,
        p_display_name: roleData.displayName,
        p_description: roleData.description,
        p_permissions: roleData.permissions,
        p_created_by: createdBy,
        p_color: roleData.color || '#747d8c',
        p_icon: roleData.icon || '🔑'
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating custom role:', error);
      throw error;
    }
  }

  /**
   * Get all custom roles
   */
  async getCustomRoles(): Promise<CustomRole[]> {
    try {
      const { data, error } = await supabase.rpc('get_custom_roles');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching custom roles:', error);
      throw error;
    }
  }

  /**
   * Update an existing custom role
   */
  async updateCustomRole(
    roleId: string,
    updates: Partial<CreateCustomRoleData>,
    updatedBy: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_custom_role', {
        p_role_id: roleId,
        p_updated_by: updatedBy,
        p_display_name: updates.displayName,
        p_description: updates.description,
        p_permissions: updates.permissions,
        p_color: updates.color,
        p_icon: updates.icon
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating custom role:', error);
      throw error;
    }
  }

  /**
   * Delete a custom role
   */
  async deleteCustomRole(roleId: string, deletedBy: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('delete_custom_role', {
        p_role_id: roleId,
        p_deleted_by: deletedBy
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deleting custom role:', error);
      throw error;
    }
  }

  /**
   * Validate role name format
   */
  validateRoleName(roleName: string): { isValid: boolean; error?: string } {
    if (!roleName) {
      return { isValid: false, error: 'Role name is required' };
    }

    if (roleName.length < 3) {
      return { isValid: false, error: 'Role name must be at least 3 characters' };
    }

    if (roleName.length > 50) {
      return { isValid: false, error: 'Role name must be less than 50 characters' };
    }

    if (!/^[a-z0-9_]+$/.test(roleName)) {
      return { isValid: false, error: 'Role name must be lowercase alphanumeric with underscores only' };
    }

    // Check against reserved role names
    const reservedRoles = ['user', 'admin', 'superadmin', 'modder', 'premium', 'slotmanager'];
    if (reservedRoles.includes(roleName)) {
      return { isValid: false, error: 'This role name is reserved' };
    }

    return { isValid: true };
  }

  /**
   * Get default permissions template
   */
  getDefaultPermissions(): CustomRolePermissions {
    return {
      canManageUsers: false,
      canManageRoles: false,
      canManageContent: false,
      canManageSlots: false,
      canModerate: false,
      canAccessPremiumFeatures: false,
      canViewAnalytics: false,
      canManagePartners: false,
    };
  }

  /**
   * Get permission templates for common roles
   */
  getPermissionTemplates(): Record<string, { name: string; permissions: CustomRolePermissions }> {
    return {
      content_manager: {
        name: 'Content Manager',
        permissions: {
          ...this.getDefaultPermissions(),
          canManageContent: true,
          canModerate: true,
        }
      },
      analyst: {
        name: 'Analyst',
        permissions: {
          ...this.getDefaultPermissions(),
          canViewAnalytics: true,
        }
      },
      partner_manager: {
        name: 'Partner Manager',
        permissions: {
          ...this.getDefaultPermissions(),
          canManagePartners: true,
          canViewAnalytics: true,
        }
      },
      vip: {
        name: 'VIP User',
        permissions: {
          ...this.getDefaultPermissions(),
          canAccessPremiumFeatures: true,
        }
      },
      support: {
        name: 'Support Agent',
        permissions: {
          ...this.getDefaultPermissions(),
          canModerate: true,
          canManageContent: true,
        }
      }
    };
  }
}

export const customRoleService = new CustomRoleService();