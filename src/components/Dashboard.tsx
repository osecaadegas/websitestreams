import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 2rem;
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 1rem;
`;

const TwitchSection = styled.section`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 3rem;
  overflow: hidden;
`;

const TwitchHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
`;

const TwitchTitle = styled.h2`
  color: #1f2937;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '🎥';
    font-size: 1.5rem;
  }
`;

const LiveIndicator = styled.div<{ $isLive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.$isLive ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)' : '#6c757d'};
  color: white;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;

  &::before {
    content: '🔴';
    animation: ${props => props.$isLive ? 'pulse 2s infinite' : 'none'};
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
  }
`;

const TwitchContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  height: 500px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    height: auto;
    gap: 1.5rem;
  }
`;

const StreamContainer = styled.div`
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const StreamEmbed = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;

  @media (max-width: 1024px) {
    height: 400px;
  }
`;

const ChatContainer = styled.div`
  position: relative;
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid #e9ecef;
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #9146ff, #6441a4);
  color: white;
  padding: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '💬';
    font-size: 1.2rem;
  }
`;

const ChatEmbed = styled.iframe`
  width: 100%;
  height: calc(100% - 60px);
  border: none;
  background: white;

  @media (max-width: 1024px) {
    height: 400px;
  }
`;

const OfflineMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  text-align: center;
  padding: 2rem;

  &::before {
    content: '📺';
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    color: #495057;
  }

  p {
    margin: 0;
    font-size: 1.1rem;
    opacity: 0.8;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const StatTitle = styled.h3`
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #9146ff;
`;

const UserProfileSection = styled.section`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const ProfileAvatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid #9146ff;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h2`
  color: #333;
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const ProfileUsername = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const ProfileDate = styled.p`
  color: #888;
  font-size: 0.9rem;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

export const Dashboard: React.FC = () => {
  const { user, getUserStats } = useAuth();
  const [stats, setStats] = useState<{
    totalSessions: number;
    lastLogin: string;
    accountAge: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStreamLive, setIsStreamLive] = useState(false);
  const [streamError, setStreamError] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const userStats = await getUserStats();
        if (userStats) {
          setStats(userStats);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkStreamStatus = async () => {
      try {
        // For demo purposes, simulate stream status
        // In production, you'd use the Twitch API to check if the stream is live
        const isLive = Math.random() > 0.3; // 70% chance of being "live" for demo
        setIsStreamLive(isLive);
      } catch (error) {
        console.error('Error checking stream status:', error);
        setStreamError(true);
      }
    };

    if (user) {
      loadStats();
      checkStreamStatus();
      
      // Check stream status every 30 seconds
      const statusInterval = setInterval(checkStreamStatus, 30000);
      
      return () => clearInterval(statusInterval);
    }
  }, [user, getUserStats]);

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>Welcome to Your Dashboard!</WelcomeTitle>
        <WelcomeSubtitle>
          Hello {user.display_name}! You're successfully authenticated with Twitch.
        </WelcomeSubtitle>
      </WelcomeSection>

      <TwitchSection>
        <TwitchHeader>
          <TwitchTitle>Twitch Stream</TwitchTitle>
          <LiveIndicator $isLive={isStreamLive}>
            {isStreamLive ? 'LIVE' : 'OFFLINE'}
          </LiveIndicator>
        </TwitchHeader>
        <TwitchContainer>
          <StreamContainer>
            {isStreamLive && !streamError ? (
              <StreamEmbed
                src={`https://player.twitch.tv/?channel=${user?.twitch_username}&parent=localhost&parent=${window.location.hostname.replace('www.', '')}`}
                allowFullScreen={true}
                title={`${user?.display_name}'s Twitch Stream`}
                onError={() => setStreamError(true)}
              />
            ) : (
              <OfflineMessage>
                <h3>{streamError ? 'Stream unavailable' : `${user?.display_name} is currently offline`}</h3>
                <p>{streamError ? 'There was an issue loading the stream.' : 'The stream will appear here when live!'}</p>
              </OfflineMessage>
            )}
          </StreamContainer>
          <ChatContainer>
            <ChatHeader>
              {isStreamLive ? 'Live Chat' : 'Chat (Offline)'}
            </ChatHeader>
            <ChatEmbed
              src={`https://www.twitch.tv/embed/${user?.twitch_username}/chat?parent=localhost&parent=${window.location.hostname.replace('www.', '')}&darkpopout`}
              title={`${user?.display_name}'s Twitch Chat`}
            />
          </ChatContainer>
        </TwitchContainer>
      </TwitchSection>

      <StatsGrid>
        <StatCard>
          <StatIcon>👤</StatIcon>
          <StatTitle>Profile Status</StatTitle>
          <StatValue>{user.is_active ? 'Active' : 'Inactive'}</StatValue>
        </StatCard>
        <StatCard>
          <StatIcon>📊</StatIcon>
          <StatTitle>Total Sessions</StatTitle>
          <StatValue>{stats?.totalSessions || 0}</StatValue>
        </StatCard>
        <StatCard>
          <StatIcon>📅</StatIcon>
          <StatTitle>Account Age</StatTitle>
          <StatValue>{stats?.accountAge || 0} days</StatValue>
        </StatCard>
        <StatCard>
          <StatIcon>🔐</StatIcon>
          <StatTitle>Last Login</StatTitle>
          <StatValue>{stats ? formatDate(stats.lastLogin) : 'N/A'}</StatValue>
        </StatCard>
      </StatsGrid>

      <UserProfileSection>
        <ProfileHeader>
          <ProfileAvatar src={user.profile_image_url} alt={user.display_name} />
          <ProfileInfo>
            <ProfileName>{user.display_name}</ProfileName>
            <ProfileUsername>@{user.twitch_username}</ProfileUsername>
            <ProfileDate>Account created: {formatDate(user.created_at)}</ProfileDate>
            <ProfileDate>Last updated: {formatDate(user.updated_at)}</ProfileDate>
          </ProfileInfo>
        </ProfileHeader>
      </UserProfileSection>

      <FeatureGrid>
        <FeatureCard>
          <FeatureIcon>🎮</FeatureIcon>
          <FeatureTitle>Gaming Hub</FeatureTitle>
          <FeatureDescription>
            Access your gaming preferences, favorite streamers, and personalized recommendations.
          </FeatureDescription>
        </FeatureCard>
        <FeatureCard>
          <FeatureIcon>📺</FeatureIcon>
          <FeatureTitle>Stream Analytics</FeatureTitle>
          <FeatureDescription>
            View detailed analytics about your streaming activity and audience engagement.
          </FeatureDescription>
        </FeatureCard>
        <FeatureCard>
          <FeatureIcon>💬</FeatureIcon>
          <FeatureTitle>Chat Integration</FeatureTitle>
          <FeatureDescription>
            Integrate with Twitch chat for enhanced interaction with your community.
          </FeatureDescription>
        </FeatureCard>
        <FeatureCard>
          <FeatureIcon>🏆</FeatureIcon>
          <FeatureTitle>Achievements</FeatureTitle>
          <FeatureDescription>
            Track your streaming milestones and unlock new achievements.
          </FeatureDescription>
        </FeatureCard>
      </FeatureGrid>
    </DashboardContainer>
  );
};