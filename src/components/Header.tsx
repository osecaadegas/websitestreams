import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const HeaderContainer = styled.header`
  background: #1a1a2e;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #2d3748;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #9146ff;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  text-decoration: none;
  color: ${props => props.$active ? '#9146ff' : '#a0aec0'};
  font-weight: ${props => props.$active ? '600' : '500'};
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #9146ff;
    background: #2d3748;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #9146ff;
`;

const UserName = styled.span`
  font-weight: 600;
  color: #333;
`;

const LogoutButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc2626;
  }
`;

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          <span>🎮</span>
          Twitch App
        </Logo>
        
        {user && (
          <>
            <Navigation>
              <NavLink to="/" $active={location.pathname === '/'}>
                Dashboard
              </NavLink>
              <NavLink to="/profile" $active={location.pathname === '/profile'}>
                Profile
              </NavLink>
            </Navigation>
            
            <UserSection>
              <UserInfo>
                <Avatar src={user.profile_image_url} alt={user.display_name} />
                <UserName>{user.display_name}</UserName>
              </UserInfo>
              <LogoutButton onClick={logout}>
                Logout
              </LogoutButton>
            </UserSection>
          </>
        )}
      </HeaderContent>
    </HeaderContainer>
  );
};