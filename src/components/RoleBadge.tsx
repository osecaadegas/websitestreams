import React from 'react';
import styled from 'styled-components';
import { UserRole, ROLE_DISPLAY_NAMES, ROLE_COLORS } from '../types/roles';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const Badge = styled.span<{ $color: string; $size: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.$size === 'small' ? '4px' : '6px'};
  padding: ${props => {
    switch (props.$size) {
      case 'small': return '2px 8px';
      case 'large': return '8px 16px';
      default: return '4px 12px';
    }
  }};
  background: ${props => props.$color}15;
  color: ${props => props.$color};
  border: 1px solid ${props => props.$color}30;
  border-radius: 20px;
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '10px';
      case 'large': return '14px';
      default: return '12px';
    }
  }};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
`;

const RoleIcon = styled.span<{ $size: string }>`
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '10px';
      case 'large': return '16px';
      default: return '12px';
    }
  }};
`;

const ROLE_ICONS: Record<UserRole, string> = {
  [UserRole.SUPERADMIN]: '👑',
  [UserRole.ADMIN]: '⚡',
  [UserRole.MODDER]: '🛡️',
  [UserRole.SLOTMANAGER]: '🎰',
  [UserRole.PREMIUM]: '💎',
  [UserRole.USER]: '👤',
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
  size = 'medium', 
  showIcon = true 
}) => {
  const color = ROLE_COLORS[role];
  const displayName = ROLE_DISPLAY_NAMES[role];
  const icon = ROLE_ICONS[role];

  return (
    <Badge $color={color} $size={size}>
      {showIcon && <RoleIcon $size={size}>{icon}</RoleIcon>}
      {displayName}
    </Badge>
  );
};