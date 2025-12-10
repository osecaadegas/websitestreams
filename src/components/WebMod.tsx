import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePermissions } from './RoleGuard';
import { useAuth } from '../context/AuthContext';
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

const FileUploadSection = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border: 2px dashed #4a5568;
  border-radius: 8px;
  background: #2d3748;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #9146ff;
    background: #1e40af20;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileUploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
`;

const FileInfo = styled.div`
  margin-top: 0.5rem;
  color: #a0aec0;
  font-size: 0.8rem;
`;

const UploadProgress = styled.div<{ $progress: number }>`
  width: 100%;
  height: 4px;
  background: #2d3748;
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    width: ${props => props.$progress}%;
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s ease;
  }
`;

const VideoModeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.5rem 1rem;
  border: 2px solid #4a5568;
  border-radius: 8px;
  background: ${props => props.$active ? '#667eea' : '#2d3748'};
  color: ${props => props.$active ? 'white' : '#a0aec0'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
  }
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
  const { user, isAuthenticated } = useAuth();
  const [videos, setVideos] = useState<VideoHighlight[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<Set<number>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<Map<number, number>>(new Map());
  const [videoModes, setVideoModes] = useState<Map<number, 'url' | 'upload'>>(new Map());

  // Debug logging (commented out for production)
  // console.log('WebMod - User:', user);
  // console.log('WebMod - isAuthenticated:', isAuthenticated);
  // console.log('WebMod - hasPermission:', hasPermission('canManageUsers'));

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
        is_uploaded_file: false,
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
        url: video.url || '',
        video_file_path: video.video_file_path || undefined,
        video_file_name: video.video_file_name || undefined,
        file_size: video.file_size || undefined,
        mime_type: video.mime_type || undefined,
        is_uploaded_file: video.is_uploaded_file || false,
        duration: video.duration,
        views: video.views
      }));
      
      console.log('Saving highlights:', highlightsToSave);
      console.log('User ID:', user?.id);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      await videoHighlightsService.batchUpdateVideoHighlights(highlightsToSave, user.id);
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
      const currentVideo = videos.find(v => v.slot_number === slotNumber);
      if (currentVideo?.is_uploaded_file) {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        await videoHighlightsService.deleteVideoFile(slotNumber, user.id);
      } else {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        await videoHighlightsService.resetVideoHighlight(slotNumber, user.id);
      }
      // Update local state
      updateVideo(slotNumber, 'title', `Highlight ${slotNumber}`);
      updateVideo(slotNumber, 'description', 'Amazing moment from stream');
      updateVideo(slotNumber, 'url', '');
      setVideos(prev => prev.map(video => 
        video.slot_number === slotNumber 
          ? { 
              ...video, 
              is_uploaded_file: false, 
              video_file_path: undefined,
              video_file_name: undefined 
            } 
          : video
      ));
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to reset video highlight:', err);
      setError('Failed to reset video highlight. Please try again.');
    }
  };

  const toggleVideoMode = (slotNumber: number, mode: 'url' | 'upload') => {
    setVideoModes(prev => new Map(prev.set(slotNumber, mode)));
    
    // Clear the opposite field when switching modes
    if (mode === 'url') {
      setVideos(prev => prev.map(video => 
        video.slot_number === slotNumber 
          ? { 
              ...video, 
              video_file_path: undefined,
              video_file_name: undefined,
              is_uploaded_file: false 
            } 
          : video
      ));
    } else {
      updateVideo(slotNumber, 'url', '');
    }
  };

  const handleFileUpload = async (slotNumber: number, file: File) => {
    try {
      setUploading(prev => new Set(prev.add(slotNumber)));
      setError(null);
      
      const currentVideo = videos.find(v => v.slot_number === slotNumber);
      if (!currentVideo) return;

      // Simulate progress for demo (in real implementation, you'd track actual upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newMap = new Map(prev);
          const current = newMap.get(slotNumber) || 0;
          if (current < 90) {
            newMap.set(slotNumber, current + 10);
          }
          return newMap;
        });
      }, 200);

      if (!user?.id) {
        throw new Error('User not authenticated - please log in again');
      }
      const result = await videoHighlightsService.uploadVideoFile(
        slotNumber,
        file,
        currentVideo.title,
        currentVideo.description,
        user.id,
        currentVideo.duration,
        currentVideo.views
      );

      clearInterval(progressInterval);
      setUploadProgress(prev => new Map(prev.set(slotNumber, 100)));

      if (result.success) {
        // Update local state with uploaded file info
        setVideos(prev => prev.map(video => 
          video.slot_number === slotNumber 
            ? { 
                ...video, 
                video_file_path: result.filePath,
                video_file_name: file.name,
                is_uploaded_file: true,
                url: '' // Clear URL when file is uploaded
              } 
            : video
        ));
        
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setUploadProgress(prev => {
            const newMap = new Map(prev);
            newMap.delete(slotNumber);
            return newMap;
          });
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to upload video:', err);
      setError(`Failed to upload video: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploading(prev => {
        const newSet = new Set(prev);
        newSet.delete(slotNumber);
        return newSet;
      });
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
              <Label>Video Source</Label>
              <VideoModeToggle>
                <ToggleButton 
                  type="button"
                  $active={videoModes.get(video.slot_number) !== 'upload'}
                  onClick={() => toggleVideoMode(video.slot_number, 'url')}
                >
                  📎 URL/Link
                </ToggleButton>
                <ToggleButton 
                  type="button"
                  $active={videoModes.get(video.slot_number) === 'upload'}
                  onClick={() => toggleVideoMode(video.slot_number, 'upload')}
                >
                  📁 Upload File
                </ToggleButton>
              </VideoModeToggle>
              
              {videoModes.get(video.slot_number) === 'upload' ? (
                <FileUploadSection>
                  <FileUploadLabel htmlFor={`file-${video.slot_number}`}>
                    📤 Choose Video File
                    <FileInput
                      id={`file-${video.slot_number}`}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(video.slot_number, file);
                        }
                      }}
                    />
                  </FileUploadLabel>
                  <FileInfo>
                    Max 100MB • MP4, WebM, OGG, MOV supported
                  </FileInfo>
                  {video.is_uploaded_file && video.video_file_name && (
                    <FileInfo style={{ color: '#10b981', marginTop: '0.5rem' }}>
                      ✅ Uploaded: {video.video_file_name}
                    </FileInfo>
                  )}
                  {uploading.has(video.slot_number) && (
                    <>
                      <FileInfo style={{ color: '#667eea' }}>
                        Uploading... {uploadProgress.get(video.slot_number) || 0}%
                      </FileInfo>
                      <UploadProgress $progress={uploadProgress.get(video.slot_number) || 0} />
                    </>
                  )}
                </FileUploadSection>
              ) : (
                <Input
                  type="url"
                  value={video.url}
                  onChange={(e) => updateVideo(video.slot_number, 'url', e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://clips.twitch.tv/..."
                />
              )}
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