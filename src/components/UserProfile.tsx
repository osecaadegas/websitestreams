import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #9146ff;
  object-fit: cover;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h1`
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const ProfileUsername = styled.p`
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const ProfileEmail = styled.p`
  color: #888;
  font-size: 1rem;
`;

const FormSection = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #9146ff;
  }
  
  &:disabled {
    background-color: #f5f5f5;
    color: #666;
    cursor: not-allowed;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'secondary' ? '#6c757d' : '#9146ff'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.variant === 'secondary' ? '#5a6268' : '#7c3aed'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const StatCard = styled.div`
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #9146ff;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const Message = styled.div<{ type: 'success' | 'error' }>`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: ${props => props.type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.type === 'success' ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.type === 'success' ? '#c3e6cb' : '#f5c6cb'};
`;

interface UserStats {
  totalSessions: number;
  lastLogin: string;
  accountAge: number;
}

export const UserProfile: React.FC = () => {
  const { user, updateProfile, getUserStats } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [formData, setFormData] = useState({
    display_name: user?.display_name || '',
    email: user?.email || '',
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name,
        email: user.email || '',
      });
      
      // Load user stats
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const userStats = await getUserStats();
      if (userStats) {
        setStats(userStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      display_name: user?.display_name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
    setMessage(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <Avatar src={user.profile_image_url} alt={user.display_name} />
        <ProfileInfo>
          <ProfileName>{user.display_name}</ProfileName>
          <ProfileUsername>@{user.twitch_username}</ProfileUsername>
          <ProfileEmail>{user.email}</ProfileEmail>
        </ProfileInfo>
      </ProfileHeader>

      {message && (
        <Message type={message.type}>
          {message.text}
        </Message>
      )}

      <FormSection>
        <SectionTitle>Profile Information</SectionTitle>
        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                type="text"
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="twitch_username">Twitch Username</Label>
              <Input
                type="text"
                id="twitch_username"
                value={user.twitch_username}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="created_at">Account Created</Label>
              <Input
                type="text"
                id="created_at"
                value={formatDate(user.created_at)}
                disabled
              />
            </FormGroup>
          </FormGrid>
          
          <ButtonGroup>
            {isEditing ? (
              <>
                <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </ButtonGroup>
        </form>
      </FormSection>

      {stats && (
        <FormSection>
          <SectionTitle>Account Statistics</SectionTitle>
          <StatsGrid>
            <StatCard>
              <StatValue>{stats.totalSessions}</StatValue>
              <StatLabel>Total Sessions</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.accountAge}</StatValue>
              <StatLabel>Account Age (Days)</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{formatDate(stats.lastLogin)}</StatValue>
              <StatLabel>Last Login</StatLabel>
            </StatCard>
          </StatsGrid>
        </FormSection>
      )}
    </ProfileContainer>
  );
};