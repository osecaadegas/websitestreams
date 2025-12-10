import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SidebarContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 20px;
  left: 20px;
  width: 280px;
  height: calc(100vh - 40px);
  background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  border-radius: 16px;
  border: 1px solid #4a5568;
  backdrop-filter: blur(10px);
  animation: slideInLeft 0.5s ease-out;
  
  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    top: 10px;
    left: 10px;
    width: calc(100vw - 20px);
    height: calc(100vh - 20px);
    border-radius: 12px;
  }
`;



const SidebarHeader = styled.div`
  padding: 30px 20px 20px;
  border-bottom: 1px solid #4a5568;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoIcon = styled.div`
  font-size: 28px;
`;

const SidebarNav = styled.nav`
  padding: 20px 0;
  flex: 1;
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 25px;
  color: ${props => props.$active ? '#e2e8f0' : '#a0aec0'};
  text-decoration: none;
  font-weight: ${props => props.$active ? '600' : '500'};
  transition: all 0.2s ease;
  border-left: 3px solid ${props => props.$active ? '#667eea' : 'transparent'};
  background: ${props => props.$active ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};
  
  &:hover {
    color: #e2e8f0;
    background: rgba(102, 126, 234, 0.1);
    border-left-color: #667eea;
  }
`;

const NavIcon = styled.div`
  font-size: 20px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavText = styled.span`
  font-size: 14px;
`;

const SidebarFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #4a5568;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  margin-bottom: 15px;
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #667eea;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  color: #e2e8f0;
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserStatus = styled.div`
  color: #a0aec0;
  font-size: 11px;
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 12px 15px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #c53030;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;



const ContentWrapper = styled.div`
  margin-left: 320px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding-left: 20px;
    padding-right: 20px;
  }
`;

interface FloatingSidebarProps {
  children: React.ReactNode;
}

export const FloatingSidebar: React.FC<FloatingSidebarProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/profile', icon: '👤', label: 'Profile' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
    { path: '/analytics', icon: '📈', label: 'Analytics' },
    { path: '/streams', icon: '📺', label: 'Streams' },
    { path: '/community', icon: '👥', label: 'Community' },
  ];

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
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              $active={location.pathname === item.path}
            >
              <NavIcon>{item.icon}</NavIcon>
              <NavText>{item.label}</NavText>
            </NavItem>
          ))}
        </SidebarNav>

        <SidebarFooter>
          <UserSection>
            <UserAvatar src={user.profile_image_url} alt={user.display_name} />
            <UserInfo>
              <UserName>{user.display_name}</UserName>
              <UserStatus>Online</UserStatus>
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