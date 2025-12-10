import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePermissions } from './RoleGuard';
import { videoHighlightsService, VideoHighlight } from '../services/videoHighlightsService';
import { videoHighlightsService, VideoHighlight } from '../services/videoHighlightsService';

const WebModContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: #0f0f23;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #2d3748;
`;

const Title = styled.h1`
  color: #e2e8f0;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '🎬';
    font-size: 1.8rem;
  }
`;

const Description = styled.p`
  color: #a0aec0;
  font-size: 1rem;
  margin: 0.5rem 0 0 0;
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const VideoCard = styled.div`
  background: #1a1a2e;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    border-color: #9146ff;
    box-shadow: 0 8px 25px rgba(145, 70, 255, 0.3);
  }
`;

const VideoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const VideoTitle = styled.h3`
  color: #e2e8f0;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
`;

const VideoIndex = styled.span`
  background: linear-gradient(135deg, #9146ff, #667eea);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  color: #e2e8f0;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #4a5568;
  background: #2d3748;
  color: #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #9146ff;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #4a5568;
  border-radius: 8px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.3s ease;
  background: #2d3748;
  color: #e2e8f0;

  &:focus {
    outline: none;
    border-color: #9146ff;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #9146ff, #667eea);
          color: white;
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(145, 70, 255, 0.3);
          }
        `;
      case 'danger':
        return `
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
          }
        `;
      default:
        return `
          background: #2d3748;
          color: #e2e8f0;
          &:hover {
            background: #4a5568;
          }
        `;
    }
  }}
`;

const PreviewSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #4a5568;
`;

const PreviewTitle = styled.h4`
  color: #e2e8f0;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
`;

const VideoPreview = styled.div`
  width: 100%;
  height: 120px;
  background: #000;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0aec0;
  font-size: 0.9rem;
  position: relative;
  overflow: hidden;
`;

const VideoFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
`;

const SaveAllButton = styled(Button)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 2rem;
  font-size: 1rem;
  z-index: 1000;
  box-shadow: 0 8px 25px rgba(145, 70, 255, 0.3);
`;

const SuccessMessage = styled.div`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '✅';
    font-size: 1.2rem;
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;



export const WebMod: React.FC = () => {
  const { hasPermission } = usePermissions();
  const [videos, setVideos] = useState<VideoHighlight[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check permissions
  if (!hasPermission('canManageUsers')) {
    return (
      <WebModContainer>
        <div style={{ textAlign: 'center', padding: '60px', color: '#a0aec0' }}>
          <h2 style={{ color: '#e2e8f0' }}>Access Denied</h2>
          <p>You don't have permission to access WebMod.</p>
        </div>
      </WebModContainer>
    );
  }

  useEffect(() => {
    loadVideoHighlights();
  }, []);

  const loadVideoHighlights = async () => {
    try {
      setLoading(true);
      setError(null);
      const highlights = await videoHighlightsService.getVideoHighlights();
      setVideos(highlights);
    } catch (err) {
      console.error('Failed to load video highlights:', err);
      setError('Failed to load video highlights');
      // Fallback to default data if database fails
      const defaultVideos: VideoHighlight[] = Array.from({ length: 12 }, (_, index) => ({
        id: index + 1,
        slot_number: index + 1,
        title: `Highlight ${index + 1}`,
        description: `Amazing moment from stream`,
        url: '',
        duration: '0:15',
        views: '1.2K'
      }));
      setVideos(defaultVideos);
    } finally {
      setLoading(false);
    }
  };

  const updateVideo = (slotNumber: number, field: keyof VideoHighlight, value: string) => {
    setVideos(prev => prev.map(video => 
      video.slot_number === slotNumber ? { ...video, [field]: value } : video
    ));
    setHasChanges(true);
  };

  const getVideoId = (url: string): string | null => {
    if (!url) return null;
    
    // YouTube video ID extraction
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return youtubeMatch[1];
    }
    
    // Twitch clip extraction
    const twitchMatch = url.match(/clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/);
    if (twitchMatch) {
      return twitchMatch[1];
    }
    
    return null;
  };

  const saveAllChanges = async () => {
    try {
      setError(null);
      const highlightsToSave = videos.map(video => ({
        slot_number: video.slot_number,
        title: video.title,
        description: video.description,
        url: video.url,
        duration: video.duration,
        views: video.views
      }));
      
      await videoHighlightsService.batchUpdateVideoHighlights(highlightsToSave);
      setHasChanges(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to save video highlights:', err);
      setError('Failed to save video highlights. Please try again.');
    }
  };

  const resetVideo = async (slotNumber: number) => {
    try {
      await videoHighlightsService.resetVideoHighlight(slotNumber);
      // Update local state
      updateVideo(slotNumber, 'title', `Highlight ${slotNumber}`);
      updateVideo(slotNumber, 'description', 'Amazing moment from stream');
      updateVideo(slotNumber, 'url', '');
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to reset video highlight:', err);
      setError('Failed to reset video highlight. Please try again.');
    }
  };

  if (loading) {
    return (
      <WebModContainer>
        <div style={{ textAlign: 'center', padding: '60px', color: '#a0aec0' }}>
          <h2 style={{ color: '#e2e8f0' }}>Loading Video Highlights...</h2>
        </div>
      </WebModContainer>
    );
  }

  return (
    <WebModContainer>
      <Header>
        <div>
          <Title>WebMod - Video Management</Title>
          <Description>Manage your stream highlight videos that appear on the dashboard</Description>
        </div>
      </Header>

      {error && (
        <ErrorMessage>
          ⚠️ {error}
        </ErrorMessage>
      )}

      {showSuccess && (
        <SuccessMessage>
          All video highlights have been saved successfully!
        </SuccessMessage>
      )}

      <VideoGrid>
        {videos.map(video => (
          <VideoCard key={video.slot_number}>
            <VideoHeader>
              <VideoTitle>Video Slot {video.slot_number}</VideoTitle>
              <VideoIndex>#{video.slot_number}</VideoIndex>
            </VideoHeader>

            <FormGroup>
              <Label>Title</Label>
              <Input
                type="text"
                value={video.title}
                onChange={(e) => updateVideo(video.slot_number, 'title', e.target.value)}
                placeholder="Enter video title"
              />
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={video.description}
                onChange={(e) => updateVideo(video.slot_number, 'description', e.target.value)}
                placeholder="Enter video description"
              />
            </FormGroup>

            <FormGroup>
              <Label>Video URL</Label>
              <Input
                type="url"
                value={video.url}
                onChange={(e) => updateVideo(video.slot_number, 'url', e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://clips.twitch.tv/..."
              />
            </FormGroup>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <FormGroup style={{ flex: 1 }}>
                <Label>Duration</Label>
                <Input
                  type="text"
                  value={video.duration}
                  onChange={(e) => updateVideo(video.slot_number, 'duration', e.target.value)}
                  placeholder="0:15"
                />
              </FormGroup>

              <FormGroup style={{ flex: 1 }}>
                <Label>View Count</Label>
                <Input
                  type="text"
                  value={video.views}
                  onChange={(e) => updateVideo(video.slot_number, 'views', e.target.value)}
                  placeholder="1.2K"
                />
              </FormGroup>
            </div>

            <ButtonGroup>
              <Button $variant="secondary" onClick={() => resetVideo(video.id)}>
                Reset
              </Button>
            </ButtonGroup>

            <PreviewSection>
              <PreviewTitle>Preview</PreviewTitle>
              <VideoPreview>
                {video.url ? (
                  getVideoId(video.url) ? (
                    video.url.includes('youtube') || video.url.includes('youtu.be') ? (
                      <VideoFrame
                        src={`https://www.youtube.com/embed/${getVideoId(video.url)}`}
                        title={video.title}
                        allowFullScreen
                      />
                    ) : (
                      <div style={{ color: 'white', textAlign: 'center' }}>
                        <div>🎬</div>
                        <div>Twitch Clip Preview</div>
                      </div>
                    )
                  ) : (
                    <div>❌ Invalid URL format</div>
                  )
                ) : (
                  <div>📹 No video URL provided</div>
                )}
              </VideoPreview>
            </PreviewSection>
          </VideoCard>
        ))}
      </VideoGrid>

      {hasChanges && (
        <SaveAllButton $variant="primary" onClick={saveAllChanges}>
          💾 Save All Changes
        </SaveAllButton>
      )}
    </WebModContainer>
  );
};