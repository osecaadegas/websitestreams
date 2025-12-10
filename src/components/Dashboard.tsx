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

    if (user) {
      loadStats();
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