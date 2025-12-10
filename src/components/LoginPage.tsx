import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const Logo = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 1.5;
`;

const LoginButton = styled.button`
  background: #9146ff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  
  &:hover {
    background: #7c3aed;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const TwitchIcon = styled.div`
  font-size: 20px;
`;

const Features = styled.div`
  margin-top: 30px;
  text-align: left;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
`;

const CheckIcon = styled.div`
  color: #10b981;
  font-weight: bold;
`;

export const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();

  const handleLogin = () => {
    login();
  };

  if (loading) {
    return (
      <LoginContainer>
        <LoginCard>
          <div>Loading...</div>
        </LoginCard>
      </LoginContainer>
    );
  }

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>🎮</Logo>
        <Title>Welcome Back!</Title>
        <Subtitle>
          Sign in with your Twitch account to access all the amazing features
        </Subtitle>
        
        <LoginButton onClick={handleLogin}>
          <TwitchIcon>📺</TwitchIcon>
          Continue with Twitch
        </LoginButton>
        
        <Features>
          <Feature>
            <CheckIcon>✓</CheckIcon>
            <span>Access your Twitch profile</span>
          </Feature>
          <Feature>
            <CheckIcon>✓</CheckIcon>
            <span>Secure OAuth authentication</span>
          </Feature>
          <Feature>
            <CheckIcon>✓</CheckIcon>
            <span>Personalized experience</span>
          </Feature>
        </Features>
      </LoginCard>
    </LoginContainer>
  );
};