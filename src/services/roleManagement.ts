import { supabase, UserProfile } from './supabase';
import { UserRole, hasPermission } from '../types/roles';

export class RoleManagementService {
  /**
   * Update a user's role (requires appropriate permissions)
   */
  async updateUserRole(
    currentUserRole: UserRole, 
    targetUserId: string, 
    newRole: UserRole
  ): Promise<UserProfile> {
    // Check if current user can manage roles
    if (!hasPermission(currentUserRole, 'canManageRoles')) {
      throw new Error('Insufficient permissions to manage roles');
    }

    // Prevent non-superadmins from creating superadmins
    if (newRole === UserRole.SUPERADMIN && currentUserRole !== UserRole.SUPERADMIN) {
      throw new Error('Only superadmins can assign superadmin role');
    }

    // Update the user's role
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all users with their roles (for admin panels)
   */
  async getAllUsers(currentUserRole: UserRole): Promise<UserProfile[]> {
    if (!hasPermission(currentUserRole, 'canManageUsers')) {
      throw new Error('Insufficient permissions to view users');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get users by specific role
   */
  async getUsersByRole(role: UserRole, currentUserRole: UserRole): Promise<UserProfile[]> {
    if (!hasPermission(currentUserRole, 'canManageUsers')) {
      throw new Error('Insufficient permissions to view users');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Check if a user can perform a specific action
   */
  canPerformAction(userRole: UserRole, action: keyof import('../types/roles').RolePermissions): boolean {
    return hasPermission(userRole, action);
  }

  /**
   * Get role hierarchy for UI purposes
   */
  getRoleHierarchy(): UserRole[] {
    return [
      UserRole.SUPERADMIN,
      UserRole.ADMIN,
      UserRole.MODDER,
      UserRole.SLOTMANAGER,
      UserRole.PREMIUM,
      UserRole.USER
    ];
  }

  /**
   * Create a custom role (requires superadmin)
   */
  async createCustomRole(
    currentUserRole: UserRole,
    roleName: string,
    permissions: Partial<import('../types/roles').RolePermissions>
  ): Promise<void> {
    if (currentUserRole !== UserRole.SUPERADMIN) {
      throw new Error('Only superadmins can create custom roles');
    }

    // This would require extending the enum in the database
    // For now, we'll throw an error with instructions
    throw new Error(
      `To create custom role "${roleName}", you need to:\n` +
      `1. Add '${roleName}' to the user_role enum in your database\n` +
      `2. Update the UserRole enum in types/roles.ts\n` +
      `3. Add permissions for the new role in ROLE_PERMISSIONS\n` +
      `4. Redeploy your application`
    );
  }

  /**
   * Bulk update user roles
   */
  async bulkUpdateRoles(
    currentUserRole: UserRole,
    userIds: string[],
    newRole: UserRole
  ): Promise<void> {
    if (!this.canPerformAction(currentUserRole, 'canManageUsers')) {
      throw new Error('Insufficient permissions to bulk update roles');
    }

    const promises = userIds.map(userId => 
      this.updateUserRole(currentUserRole, userId, newRole)
    );

    await Promise.all(promises);
  }

  /**
   * Get user activity summary
   */
  async getUserActivity(currentUserRole: UserRole, days: number = 30): Promise<any> {
    if (!this.canPerformAction(currentUserRole, 'canViewAnalytics')) {
      throw new Error('Insufficient permissions to view user activity');
    }

    const { data, error } = await supabase
      .rpc('get_user_activity_summary', { days_back: days });

    if (error) throw error;
    return data;
  }

  /**
   * Check if roleA can manage roleB
   */
  canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    const hierarchy = this.getRoleHierarchy();
    const managerIndex = hierarchy.indexOf(managerRole);
    const targetIndex = hierarchy.indexOf(targetRole);
    
    // Higher roles (lower index) can manage lower roles (higher index)
    // But only superadmin can manage superadmin
    if (targetRole === UserRole.SUPERADMIN && managerRole !== UserRole.SUPERADMIN) {
      return false;
    }
    
    return managerIndex <= targetIndex;
  }
}

export const roleManagementService = new RoleManagementService();