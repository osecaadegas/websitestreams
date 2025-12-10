import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SidebarContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 15px;
  left: 15px;
  width: 220px;
  height: calc(100vh - 30px);
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
    top: 10px;
    left: 10px;
    width: calc(100vw - 20px);
    height: calc(100vh - 20px);
    border-radius: 16px;
  }
`;



const SidebarHeader = styled.div`
  padding: 20px 18px 16px;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  display: flex;
  align-items: center;
  gap: 12px;
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
  padding: 12px 8px;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin: 2px 0;
  color: ${props => props.$active ? '#f1f5f9' : '#94a3b8'};
  text-decoration: none;
  font-weight: ${props => props.$active ? '600' : '500'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  position: relative;
  overflow: hidden;
  
  &:hover {
    color: #f1f5f9;
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
`;

const SidebarFooter = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
  flex-shrink: 0;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  margin-bottom: 12px;
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

const UserStatus = styled.div`
  color: #94a3b8;
  font-size: 10px;
  line-height: 1;
  margin-top: 2px;
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 10px 12px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 12px;
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