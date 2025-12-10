export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  MODDER = 'modder',
  SLOTMANAGER = 'slotmanager',
  PREMIUM = 'premium',
  USER = 'user'
}

export interface RolePermissions {
  canManageUsers: boolean;
  canManageRoles: boolean;
  canManageContent: boolean;
  canManageSlots: boolean;
  canModerate: boolean;
  canAccessPremiumFeatures: boolean;
  canViewAnalytics: boolean;
  canManagePartners: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.SUPERADMIN]: {
    canManageUsers: true,
    canManageRoles: true,
    canManageContent: true,
    canManageSlots: true,
    canModerate: true,
    canAccessPremiumFeatures: true,
    canViewAnalytics: true,
    canManagePartners: true,
  },
  [UserRole.ADMIN]: {
    canManageUsers: true,
    canManageRoles: false,
    canManageContent: true,
    canManageSlots: true,
    canModerate: true,
    canAccessPremiumFeatures: true,
    canViewAnalytics: true,
    canManagePartners: true,
  },
  [UserRole.MODDER]: {
    canManageUsers: false,
    canManageRoles: false,
    canManageContent: true,
    canManageSlots: false,
    canModerate: true,
    canAccessPremiumFeatures: false,
    canViewAnalytics: false,
    canManagePartners: false,
  },
  [UserRole.SLOTMANAGER]: {
    canManageUsers: false,
    canManageRoles: false,
    canManageContent: false,
    canManageSlots: true,
    canModerate: false,
    canAccessPremiumFeatures: false,
    canViewAnalytics: false,
    canManagePartners: false,
  },
  [UserRole.PREMIUM]: {
    canManageUsers: false,
    canManageRoles: false,
    canManageContent: false,
    canManageSlots: false,
    canModerate: false,
    canAccessPremiumFeatures: true,
    canViewAnalytics: false,
    canManagePartners: false,
  },
  [UserRole.USER]: {
    canManageUsers: false,
    canManageRoles: false,
    canManageContent: false,
    canManageSlots: false,
    canModerate: false,
    canAccessPremiumFeatures: false,
    canViewAnalytics: false,
    canManagePartners: false,
  },
};

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.SUPERADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.MODDER]: 'Moderator',
  [UserRole.SLOTMANAGER]: 'Slot Manager',
  [UserRole.PREMIUM]: 'Premium User',
  [UserRole.USER]: 'User',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.SUPERADMIN]: '#ff6b6b',
  [UserRole.ADMIN]: '#ffa502',
  [UserRole.MODDER]: '#3742fa',
  [UserRole.SLOTMANAGER]: '#2ed573',
  [UserRole.PREMIUM]: '#ffd700',
  [UserRole.USER]: '#747d8c',
};

export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role][permission];
}