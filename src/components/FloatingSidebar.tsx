import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './RoleBadge';
import { usePermissions } from './RoleGuard';

const SidebarContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 20px;
  left: 20px;
  width: 220px;
  height: auto;
  max-height: 80vh;
  background: rgba(30, 41, 59, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  border-radius: 20px;
  border: 1px solid rgba(71, 85, 105, 0.3);
  backdrop-filter: blur(20px);
  animation: slideInLeft 0.4s ease-out;
  display: flex;
  flex-direction: column;
  
  @keyframes slideInLeft {
    from {
      transform: translateX(-100%) scale(0.95);
      opacity: 0;
    }
    to {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    top: 15px;
    left: 15px;
    width: calc(100vw - 30px);
    max-height: 70vh;
    border-radius: 16px;
  }
`;



const SidebarHeader = styled.div`
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const Logo = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.5px;
`;

const LogoIcon = styled.div`
  font-size: 20px;
  filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.3));
`;

const SidebarNav = styled.nav`
  padding: 8px 8px;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  min-height: 0;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin: 1px 0;
  color: ${props => props.$active ? '#e2e8f0' : '#a0aec0'};
  text-decoration: none;
  font-weight: ${props => props.$active ? '600' : '500'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  position: relative;
  overflow: hidden;
  
  &:hover {
    color: #e2e8f0;
    background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(102, 126, 234, 0.15)'};
    transform: translateX(2px);
  }
  
  &:active {
    transform: translateX(1px) scale(0.98);
  }
`;

const NavIcon = styled.div`
  font-size: 16px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const NavText = styled.span`
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.2px;
  flex: 1;
`;

const NavButton = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin: 1px 0;
  color: ${props => props.$active ? '#e2e8f0' : '#a0aec0'};
  font-weight: ${props => props.$active ? '600' : '500'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  cursor: pointer;
  
  &:hover {
    color: #e2e8f0;
    background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(102, 126, 234, 0.15)'};
    transform: translateX(2px);
  }
`;

const DropdownArrow = styled.span<{ $expanded: boolean }>`
  font-size: 12px;
  transition: transform 0.2s ease;
  transform: ${props => props.$expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const SubItemsContainer = styled.div<{ $expanded: boolean }>`
  max-height: ${props => props.$expanded ? '200px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding-left: 28px;
`;

const SubNavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  margin: 1px 0;
  color: ${props => props.$active ? '#e2e8f0' : '#a0aec0'};
  text-decoration: none;
  font-size: 12px;
  font-weight: ${props => props.$active ? '600' : '500'};
  transition: all 0.2s ease;
  border-radius: 8px;
  background: ${props => props.$active ? 'rgba(102, 126, 234, 0.3)' : 'transparent'};
  
  &:hover {
    color: #e2e8f0;
    background: rgba(102, 126, 234, 0.2);
    transform: translateX(2px);
  }
`;

const SidebarFooter = styled.div`
  padding: 12px 16px 16px;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
  flex-shrink: 0;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  margin-bottom: 10px;
  border: 1px solid rgba(71, 85, 105, 0.2);
`;

const UserAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(102, 126, 234, 0.5);
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.div`
  color: #f1f5f9;
  font-weight: 600;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: -0.2px;
  
  &:hover {
    background: rgba(220, 38, 38, 0.95);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;



const ContentWrapper = styled.div`
  margin-left: 250px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding-left: 15px;
    padding-right: 15px;
  }
`;

interface FloatingSidebarProps {
  children: React.ReactNode;
}

export const FloatingSidebar: React.FC<FloatingSidebarProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const allNavItems = [
    { path: '/', icon: '🏠', label: 'Home', requiresPermission: null },
    { path: '/partners-offers', icon: '🤝', label: 'Partners!Offers', requiresPermission: 'canManagePartners' as const },
    { path: '/settings', icon: '🛒', label: 'Store', requiresPermission: null },
    { 
      path: '/games', 
      icon: '🎮', 
      label: 'Games', 
      requiresPermission: null,
      subItems: [
        { path: '/games/blackjack', label: 'Blackjack' },
        { path: '/games/mines', label: 'Mines' },
        { path: '/games/gates-of-distilary', label: 'Gates of Distilary' }
      ]
    },
    { path: '/streams', icon: '📺', label: 'Streams', requiresPermission: null },
    { path: '/community', icon: '👥', label: 'Community', requiresPermission: null },
    { path: '/admin', icon: '🔧', label: 'Admin Panel', requiresPermission: 'canManageUsers' as const },
    { path: '/webmod', icon: '🎬', label: 'WebMod', requiresPermission: 'canManageUsers' as const },
  ];

  // Filter nav items based on user permissions
  const navItems = allNavItems.filter(item => 
    !item.requiresPermission || hasPermission(item.requiresPermission)
  );

  if (!user) {
    return <>{children}</>;
  }

  return (
    <>
      <SidebarContainer $isOpen={true}>
        <SidebarHeader>
          <Logo>
            <LogoIcon>🎮</LogoIcon>
            <span>StreamApp</span>
          </Logo>
        </SidebarHeader>

        <SidebarNav>
          {navItems.map((item) => {
            const isExpanded = expandedItems.includes(item.path);
            const isActive = location.pathname === item.path || 
              (item.subItems && item.subItems.some(sub => location.pathname === sub.path));
            
            if (item.subItems) {
              return (
                <div key={item.path}>
                  <NavButton
                    $active={isActive}
                    onClick={() => setExpandedItems(prev => 
                      prev.includes(item.path) 
                        ? prev.filter(p => p !== item.path)
                        : [...prev, item.path]
                    )}
                  >
                    <NavIcon>{item.icon}</NavIcon>
                    <NavText>{item.label}</NavText>
                    <DropdownArrow $expanded={isExpanded}>▼</DropdownArrow>
                  </NavButton>
                  <SubItemsContainer $expanded={isExpanded}>
                    {item.subItems.map(subItem => (
                      <SubNavItem
                        key={subItem.path}
                        to={subItem.path}
                        $active={location.pathname === subItem.path}
                      >
                        {subItem.label}
                      </SubNavItem>
                    ))}
                  </SubItemsContainer>
                </div>
              );
            }
            
            return (
              <NavItem
                key={item.path}
                to={item.path}
                $active={location.pathname === item.path}
              >
                <NavIcon>{item.icon}</NavIcon>
                <NavText>{item.label}</NavText>
              </NavItem>
            );
          })}
        </SidebarNav>

        <SidebarFooter>
          <UserSection>
            <UserAvatar src={user.profile_image_url} alt={user.display_name} />
            <UserInfo>
              <UserName>{user.display_name}</UserName>
              <RoleBadge role={user.role} size="small" />
            </UserInfo>
          </UserSection>
          
          <LogoutButton onClick={logout}>
            Sign Out
          </LogoutButton>
        </SidebarFooter>
      </SidebarContainer>

      <ContentWrapper>
        {children}
      </ContentWrapper>
    </>
  );
};