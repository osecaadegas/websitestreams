import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, hasPermission, RolePermissions } from '../types/roles';
import styled from 'styled-components';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: keyof RolePermissions;
  fallback?: React.ReactNode;
  allowedRoles?: UserRole[];
}

const AccessDeniedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
  background: #f8fafc;
  border-radius: 12px;
  margin: 20px;
  text-align: center;
`;

const AccessDeniedIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const AccessDeniedTitle = styled.h2`
  color: #374151;
  font-size: 24px;
  margin-bottom: 12px;
  font-weight: 600;
`;

const AccessDeniedMessage = styled.p`
  color: #6b7280;
  font-size: 16px;
  line-height: 1.5;
  max-width: 400px;
`;

const DefaultAccessDenied = () => (
  <AccessDeniedContainer>
    <AccessDeniedIcon>🔒</AccessDeniedIcon>
    <AccessDeniedTitle>Access Denied</AccessDeniedTitle>
    <AccessDeniedMessage>
      You don't have the required permissions to access this content.
      Contact an administrator if you believe this is an error.
    </AccessDeniedMessage>
  </AccessDeniedContainer>
);

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
  allowedRoles,
  fallback = <DefaultAccessDenied />
}) => {
  const { user } = useAuth();

  // If user is not logged in, deny access
  if (!user) {
    return <>{fallback}</>;
  }

  const userRole = user.role;

  // Check specific role requirement
  if (requiredRole && userRole !== requiredRole) {
    return <>{fallback}</>;
  }

  // Check allowed roles
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Higher Order Component version
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<RoleGuardProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <RoleGuard {...guardProps}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}

// Hook for checking permissions in components
export function usePermissions() {
  const { user } = useAuth();

  return {
    user,
    role: user?.role || UserRole.USER,
    hasPermission: (permission: keyof RolePermissions) => 
      user ? hasPermission(user.role, permission) : false,
    isRole: (role: UserRole) => user?.role === role,
    hasAnyRole: (roles: UserRole[]) => user ? roles.includes(user.role) : false,
  };
}