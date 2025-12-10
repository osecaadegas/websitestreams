import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { videoHighlightsService, VideoHighlight } from '../services/videoHighlightsService';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: #0f0f23;
  min-height: 100vh;
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
  background: #1a1a2e;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  padding: 1.5rem;
  margin-bottom: 2rem;
  overflow: hidden;
  border: 1px solid #2d3748;
`;

const TwitchHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #4a5568;
`;

const TwitchTitle = styled.h2`
  color: #e2e8f0;
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
  gap: 1.5rem;
  height: 350px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    height: auto;
    gap: 1rem;
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

const Footer = styled.footer`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 2rem 0 1.5rem;
  margin-top: 2rem;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }
`;

const FooterSection = styled.div`
  h3 {
    color: #9146ff;
    font-size: 1.1rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  p {
    color: #b4b4c7;
    line-height: 1.5;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 0.5rem;
  }

  a {
    color: #b4b4c7;
    text-decoration: none;
    transition: color 0.3s ease;
    font-size: 0.9rem;

    &:hover {
      color: #9146ff;
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(145, 70, 255, 0.1);
  border-radius: 50%;
  color: #9146ff;
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    background: #9146ff;
    color: white;
    transform: translateY(-2px);
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid #2a2a3e;
  margin-top: 1.5rem;
  padding-top: 1rem;
  text-align: center;
  color: #8e8ea0;
  font-size: 0.8rem;
`;

const BrandLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.75rem;

  @media (max-width: 768px) {
    justify-content: center;
  }

  &::before {
    content: '🎬';
    font-size: 1.5rem;
  }
`;

const HighlightsSection = styled.section`
  background: #1a1a2e;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #2d3748;
`;

const HighlightsHeader = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;
`;

const HighlightsTitle = styled.h2`
  color: #e2e8f0;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &::before {
    content: '🎥';
    font-size: 1.5rem;
  }
`;

const HighlightsSubtitle = styled.p`
  color: #a0aec0;
  font-size: 1rem;
  margin: 0;
`;

const ClipsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
  height: 400px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 1fr);
    height: 500px;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(6, 1fr);
    height: 800px;
  }
`;

const ClipCard = styled.div`
  background: #000;
  border-radius: 16px;
  padding: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(145, 70, 255, 0.3);
    border-color: #9146ff;
  }

  &:hover .play-overlay {
    opacity: 1;
    transform: scale(1);
  }

  &:hover .clip-info {
    transform: translateY(0);
    opacity: 1;
  }
`;

const ClipIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.7;

  .clip-card:hover & {
    opacity: 1;
  }
`;

const ClipTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: inherit;
`;

const ClipDescription = styled.p`
  font-size: 0.75rem;
  margin: 0;
  opacity: 0.8;
  color: inherit;
`;

const ClipThumbnail = styled.div<{ $bgImage?: string }>`
  width: 100%;
  height: 70%;
  background: ${props => props.$bgImage ? `url(${props.$bgImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlayOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  width: 60px;
  height: 60px;
  background: rgba(145, 70, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);

  &::after {
    content: '';
    width: 0;
    height: 0;
    border-left: 18px solid white;
    border-top: 12px solid transparent;
    border-bottom: 12px solid transparent;
    margin-left: 4px;
  }
`;

const ClipInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  color: white;
  padding: 1rem;
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.3s ease;
`;

const ClipDuration = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
`;

const ClipViews = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(145, 70, 255, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '👁';
    font-size: 0.8rem;
  }
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
  const [videoHighlights, setVideoHighlights] = useState<VideoHighlight[]>([]);

  const getVideoId = (url: string): string | null => {
    if (!url) return null;
    
    // YouTube video ID extraction
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return youtubeMatch[1];
    }
    
    return null;
  };

  const getTwitchClipId = (url: string): string | null => {
    if (!url) return null;
    
    // Twitch clip ID extraction
    const twitchMatch = url.match(/clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/);
    if (twitchMatch) {
      return twitchMatch[1];
    }
    
    return null;
  };

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

    const loadVideoHighlights = async () => {
      try {
        const highlights = await videoHighlightsService.getVideoHighlights();
        setVideoHighlights(highlights);
      } catch (error) {
        console.error('Error loading video highlights:', error);
      }
    };

    if (user) {
      loadStats();
      checkStreamStatus();
      loadVideoHighlights();
      
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

      <HighlightsSection>
        <HighlightsHeader>
          <HighlightsTitle>Stream Highlights</HighlightsTitle>
          <HighlightsSubtitle>Best moments from recent streams</HighlightsSubtitle>
        </HighlightsHeader>
        <ClipsGrid>
          {videoHighlights.map((highlight) => {
            const hasUrl = highlight.url && highlight.url.trim() !== '';
            const hasUploadedFile = highlight.is_uploaded_file && highlight.video_file_path;
            const hasContent = hasUrl || hasUploadedFile;
            
            const handleClick = (e: React.MouseEvent) => {
              // Don't open external links if video is playing inline
              if (hasUploadedFile || (hasUrl && (highlight.url.includes('youtube') || highlight.url.includes('twitch.tv/')))) {
                e.preventDefault();
                return;
              }
              
              if (hasUrl) {
                window.open(highlight.url, '_blank');
              } else {
                console.log(`No content for ${highlight.title}`);
              }
            };

            return (
              <ClipCard 
                key={highlight.slot_number} 
                onClick={handleClick}
                style={{ opacity: hasContent ? 1 : 0.6 }}
              >
                <ClipThumbnail>
                  {hasUploadedFile ? (
                    <video
                      src={highlight.video_file_path}
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                      onError={(e) => console.error('Video error:', e)}
                    />
                  ) : hasUrl && highlight.url.includes('youtube') ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getVideoId(highlight.url)}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1`}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                      allow="autoplay; encrypted-media"
                      title={highlight.title}
                    />
                  ) : hasUrl && highlight.url.includes('twitch.tv/') ? (
                    <iframe
                      src={`https://clips.twitch.tv/embed?clip=${getTwitchClipId(highlight.url)}&parent=${window.location.hostname}&muted=true&autoplay=true`}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                      allowFullScreen
                      title={highlight.title}
                    />
                  ) : (
                    <PlayOverlay className="play-overlay" />
                  )}
                  <ClipDuration>{highlight.duration}</ClipDuration>
                  <ClipViews>{highlight.views}</ClipViews>
                  {hasUploadedFile && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '4px', 
                      left: '4px', 
                      fontSize: '12px',
                      background: 'rgba(0,0,0,0.7)',
                      padding: '2px 4px',
                      borderRadius: '4px'
                    }}>
                      📁
                    </div>
                  )}
                </ClipThumbnail>
                <ClipInfo className="clip-info">
                  <ClipTitle>{highlight.title}</ClipTitle>
                  <ClipDescription>
                    {highlight.description}
                    {hasUploadedFile && (
                      <span style={{ color: '#10b981', fontSize: '11px', marginLeft: '4px' }}>
                        • Uploaded
                      </span>
                    )}
                  </ClipDescription>
                </ClipInfo>
              </ClipCard>
            );
          })}
        </ClipsGrid>
      </HighlightsSection>

      <Footer>
        <FooterContent>
          <FooterSection>
            <BrandLogo>
              StreamHub
            </BrandLogo>
            <p>
              Your ultimate streaming companion. Connect, engage, and grow your community with powerful tools and analytics.
            </p>
            <SocialLinks>
              <SocialLink href="#" target="_blank">
                📺
              </SocialLink>
              <SocialLink href="#" target="_blank">
                🐦
              </SocialLink>
              <SocialLink href="#" target="_blank">
                📷
              </SocialLink>
              <SocialLink href="#" target="_blank">
                💬
              </SocialLink>
            </SocialLinks>
          </FooterSection>
          
          <FooterSection>
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#">Dashboard</a></li>
              <li><a href="#">Stream Analytics</a></li>
              <li><a href="#">Community</a></li>
              <li><a href="#">Settings</a></li>
              <li><a href="#">Support</a></li>
            </ul>
          </FooterSection>
          
          <FooterSection>
            <h3>Resources</h3>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">API Documentation</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </FooterSection>
        </FooterContent>
        
        <FooterBottom>
          <p>&copy; 2025 StreamHub. All rights reserved. Built with ❤️ for streamers.</p>
        </FooterBottom>
      </Footer>
    </DashboardContainer>
  );
};