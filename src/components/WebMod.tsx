import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePermissions } from './RoleGuard';
import { useAuth } from '../context/AuthContext';
import { videoHighlightsService, VideoHighlight } from '../services/videoHighlightsService';
import { partnerOffersService, PartnerOffer, PartnerOfferInput } from '../services/partnerOffersService';

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

const CategoryTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 0.5rem;
  background: #1a1a2e;
  border-radius: 12px;
  border: 1px solid #2d3748;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  ${props => props.$active ? `
    background: linear-gradient(135deg, #9146ff, #667eea);
    color: white;
    box-shadow: 0 4px 15px rgba(145, 70, 255, 0.3);
  ` : `
    background: transparent;
    color: #a0aec0;
    
    &:hover {
      background: rgba(145, 70, 255, 0.1);
      color: #e2e8f0;
    }
  `}
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



// Partner Offers Management Component
interface PartnerOffersManagementProps {
  offers: PartnerOffer[];
  onCreateOffer: () => void;
  onEditOffer: (offer: PartnerOffer) => void;
  onDeleteOffer: (offerId: string) => void;
  onToggleStatus: (offerId: string) => void;
  showForm: boolean;
  editingOffer: PartnerOfferInput | null;
  onSaveOffer: (offer: PartnerOfferInput) => void;
  onCancelEdit: () => void;
  onImageUpload: (file: File, offerId?: string) => Promise<string>;
  uploadingImage: boolean;
}

const PartnerOffersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const OfferCard = styled.div<{ $active: boolean }>`
  background: #1a1a2e;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid ${props => props.$active ? '#10b981' : '#2d3748'};
  transition: all 0.3s ease;
  opacity: ${props => props.$active ? 1 : 0.7};

  &:hover {
    border-color: #9146ff;
    box-shadow: 0 8px 25px rgba(145, 70, 255, 0.3);
  }
`;

const OfferHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const OfferTitle = styled.h3`
  color: #e2e8f0;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
`;

const OfferBadges = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
  align-items: flex-end;
`;

const Badge = styled.span<{ $variant: 'featured' | 'active' | 'inactive' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${props => {
    switch (props.$variant) {
      case 'featured':
        return `
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        `;
      case 'active':
        return `
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        `;
      case 'inactive':
        return `
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        `;
    }
  }}
`;

const OfferActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionBtn = styled.button<{ $variant?: 'edit' | 'delete' | 'toggle' }>`
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.$variant) {
      case 'edit':
        return `
          background: rgba(145, 70, 255, 0.2);
          color: #9146ff;
          &:hover { background: rgba(145, 70, 255, 0.3); }
        `;
      case 'delete':
        return `
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          &:hover { background: rgba(239, 68, 68, 0.3); }
        `;
      case 'toggle':
        return `
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          &:hover { background: rgba(16, 185, 129, 0.3); }
        `;
      default:
        return `
          background: #2d3748;
          color: #e2e8f0;
          &:hover { background: #4a5568; }
        `;
    }
  }}
`;

// Partner Offer Form Component
interface PartnerOfferFormProps {
  offer: PartnerOfferInput;
  onSave: (offer: PartnerOfferInput) => void;
  onCancel: () => void;
  onImageUpload: (file: File) => Promise<string>;
  uploadingImage: boolean;
}

const FormModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const FormContainer = styled.div`
  background: #1a1a2e;
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageUploadArea = styled.div`
  border: 2px dashed #4a5568;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s ease;
  background: #2d3748;
  
  &:hover {
    border-color: #9146ff;
  }
`;

const ArrayInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Tag = styled.span`
  background: rgba(145, 70, 255, 0.2);
  color: #9146ff;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const TagRemoveBtn = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  margin: 0;
`;

const PartnerOfferForm: React.FC<PartnerOfferFormProps> = ({
  offer,
  onSave,
  onCancel,
  onImageUpload,
  uploadingImage
}) => {
  const [formData, setFormData] = useState<PartnerOfferInput>(offer);
  const [newDepositMethod, setNewDepositMethod] = useState('');
  const [newWithdrawalMethod, setNewWithdrawalMethod] = useState('');
  const [newCountryRestriction, setNewCountryRestriction] = useState('');

  const handleInputChange = (field: keyof PartnerOfferInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await onImageUpload(file);
        handleInputChange('image_file_path', imageUrl);
        handleInputChange('image_url', ''); // Clear URL when file is uploaded
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }
  };

  const addArrayItem = (field: 'deposit_methods' | 'withdrawal_methods' | 'country_restrictions', value: string) => {
    if (value.trim()) {
      const currentArray = formData[field] || [];
      handleInputChange(field, [...currentArray, value.trim()]);
    }
  };

  const removeArrayItem = (field: 'deposit_methods' | 'withdrawal_methods' | 'country_restrictions', index: number) => {
    const currentArray = formData[field] || [];
    handleInputChange(field, currentArray.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <FormModal onClick={onCancel}>
      <FormContainer onClick={e => e.stopPropagation()}>
        <h3 style={{ color: '#e2e8f0', marginBottom: '1.5rem' }}>
          {offer.id ? 'Edit Partner Offer' : 'Create New Partner Offer'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter offer title"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Min Deposit ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.min_deposit || ''}
                onChange={(e) => handleInputChange('min_deposit', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
            </FormGroup>

            <FormGroup style={{ gridColumn: '1 / -1' }}>
              <Label>Description *</Label>
              <TextArea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the offer in detail"
                rows={3}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Bonus</Label>
              <Input
                value={formData.bonus || ''}
                onChange={(e) => handleInputChange('bonus', e.target.value)}
                placeholder="e.g., 100% up to $500"
              />
            </FormGroup>

            <FormGroup>
              <Label>Cashback</Label>
              <Input
                value={formData.cashback || ''}
                onChange={(e) => handleInputChange('cashback', e.target.value)}
                placeholder="e.g., 10% daily"
              />
            </FormGroup>

            <FormGroup>
              <Label>Free Spins</Label>
              <Input
                value={formData.free_spins || ''}
                onChange={(e) => handleInputChange('free_spins', e.target.value)}
                placeholder="e.g., 50 free spins"
              />
            </FormGroup>

            <FormGroup>
              <Label>Max Bonus ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.max_bonus || ''}
                onChange={(e) => handleInputChange('max_bonus', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
            </FormGroup>

            <FormGroup style={{ gridColumn: '1 / -1' }}>
              <Label>Affiliate Link</Label>
              <Input
                type="url"
                value={formData.affiliate_link || ''}
                onChange={(e) => handleInputChange('affiliate_link', e.target.value)}
                placeholder="https://affiliate-link.com"
              />
            </FormGroup>

            <FormGroup style={{ gridColumn: '1 / -1' }}>
              <Label>Image Upload</Label>
              <ImageUploadArea>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label htmlFor="image-upload" style={{ cursor: 'pointer', display: 'block' }}>
                  {uploadingImage ? (
                    <p style={{ color: '#9146ff' }}>Uploading...</p>
                  ) : (
                    <>
                      <p style={{ color: '#e2e8f0', margin: '0 0 0.5rem 0' }}>
                        📁 Click to upload image
                      </p>
                      <p style={{ color: '#a0aec0', fontSize: '0.8rem', margin: 0 }}>
                        Max 10MB - JPEG, PNG, WebP, GIF
                      </p>
                    </>
                  )}
                </label>
              </ImageUploadArea>
            </FormGroup>
          </FormGrid>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
              <input
                type="checkbox"
                checked={formData.vpn_friendly}
                onChange={(e) => handleInputChange('vpn_friendly', e.target.checked)}
              />
              VPN Friendly
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => handleInputChange('is_featured', e.target.checked)}
              />
              Featured Offer
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
              />
              Active
            </label>
          </div>

          <ButtonGroup>
            <Button type="submit" $variant="primary">
              💾 Save Offer
            </Button>
            <Button type="button" onClick={onCancel}>
              ❌ Cancel
            </Button>
          </ButtonGroup>
        </form>
      </FormContainer>
    </FormModal>
  );
};

const PartnerOffersManagement: React.FC<PartnerOffersManagementProps> = ({
  offers,
  onCreateOffer,
  onEditOffer,
  onDeleteOffer,
  onToggleStatus,
  showForm,
  editingOffer,
  onSaveOffer,
  onCancelEdit,
  onImageUpload,
  uploadingImage
}) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#e2e8f0', margin: 0 }}>Partner Offers Management</h2>
        <Button $variant="primary" onClick={onCreateOffer}>
          ➕ Create New Offer
        </Button>
      </div>

      {showForm && editingOffer && (
        <PartnerOfferForm
          offer={editingOffer}
          onSave={onSaveOffer}
          onCancel={onCancelEdit}
          onImageUpload={onImageUpload}
          uploadingImage={uploadingImage}
        />
      )}

      <PartnerOffersGrid>
        {offers.map(offer => (
          <OfferCard key={offer.id} $active={offer.is_active}>
            <OfferHeader>
              <OfferTitle>{offer.title}</OfferTitle>
              <OfferBadges>
                {offer.is_featured && <Badge $variant="featured">★ Featured</Badge>}
                <Badge $variant={offer.is_active ? 'active' : 'inactive'}>
                  {offer.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </OfferBadges>
            </OfferHeader>
            
            <p style={{ color: '#a0aec0', fontSize: '0.9rem', margin: '0.5rem 0' }}>
              {offer.description.length > 100 
                ? `${offer.description.substring(0, 100)}...` 
                : offer.description
              }
            </p>

            {offer.min_deposit && (
              <p style={{ color: '#9146ff', fontSize: '0.8rem', margin: '0.5rem 0' }}>
                Min Deposit: ${offer.min_deposit}
              </p>
            )}

            <OfferActions>
              <ActionBtn $variant="edit" onClick={() => onEditOffer(offer)}>
                ✏️ Edit
              </ActionBtn>
              <ActionBtn $variant="toggle" onClick={() => onToggleStatus(offer.id)}>
                {offer.is_active ? '⏸️ Disable' : '▶️ Enable'}
              </ActionBtn>
              <ActionBtn $variant="delete" onClick={() => onDeleteOffer(offer.id)}>
                🗑️ Delete
              </ActionBtn>
            </OfferActions>
          </OfferCard>
        ))}
      </PartnerOffersGrid>
    </div>
  );
};

export const WebMod: React.FC = () => {
  const { hasPermission } = usePermissions();
  const { user, isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'videos' | 'partners'>('videos');
  const [videos, setVideos] = useState<VideoHighlight[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<Set<number>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<Map<number, number>>(new Map());
  const [videoModes, setVideoModes] = useState<Map<number, 'url' | 'upload'>>(new Map());
  
  // Partner offers state
  const [partnerOffers, setPartnerOffers] = useState<PartnerOffer[]>([]);
  const [editingOffer, setEditingOffer] = useState<PartnerOfferInput | null>(null);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  // Partner Offers Functions
  const loadPartnerOffers = async () => {
    try {
      const offers = await partnerOffersService.getPartnerOffers(true);
      setPartnerOffers(offers);
    } catch (err) {
      console.error('Failed to load partner offers:', err);
      setError('Failed to load partner offers');
    }
  };

  const handleCreateOffer = () => {
    setEditingOffer(partnerOffersService.createEmptyOffer());
    setShowOfferForm(true);
  };

  const handleEditOffer = (offer: PartnerOffer) => {
    setEditingOffer({ ...offer });
    setShowOfferForm(true);
  };

  const handleSaveOffer = async (offer: PartnerOfferInput) => {
    try {
      const validation = partnerOffersService.validateOffer(offer);
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        return;
      }

      await partnerOffersService.upsertPartnerOffer(offer);
      await loadPartnerOffers();
      setShowOfferForm(false);
      setEditingOffer(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save partner offer:', err);
      setError(`Failed to save partner offer: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }
    
    try {
      await partnerOffersService.deletePartnerOffer(offerId);
      await loadPartnerOffers();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to delete partner offer:', err);
      setError(`Failed to delete partner offer: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleToggleOfferStatus = async (offerId: string) => {
    try {
      await partnerOffersService.togglePartnerOfferStatus(offerId);
      await loadPartnerOffers();
    } catch (err) {
      console.error('Failed to toggle offer status:', err);
      setError(`Failed to toggle offer status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleImageUpload = async (file: File, offerId?: string) => {
    try {
      setUploadingImage(true);
      const imageUrl = await partnerOffersService.uploadOfferImage(file, offerId);
      return imageUrl;
    } catch (err) {
      console.error('Failed to upload image:', err);
      throw err;
    } finally {
      setUploadingImage(false);
    }
  };

  // Load partner offers when switching to partners tab
  useEffect(() => {
    if (activeCategory === 'partners') {
      loadPartnerOffers();
    }
  }, [activeCategory]);

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
          <Title>WebMod - Management Panel</Title>
          <Description>Manage your content that appears on the website</Description>
        </div>
      </Header>

      <CategoryTabs>
        <TabButton 
          $active={activeCategory === 'videos'} 
          onClick={() => setActiveCategory('videos')}
        >
          🎬 Video Management
        </TabButton>
        <TabButton 
          $active={activeCategory === 'partners'} 
          onClick={() => setActiveCategory('partners')}
        >
          🤝 Partner Offers
        </TabButton>
      </CategoryTabs>

      {error && (
        <ErrorMessage>
          ⚠️ {error}
        </ErrorMessage>
      )}

      {showSuccess && (
        <SuccessMessage>
          {activeCategory === 'videos' 
            ? 'All video highlights have been saved successfully!' 
            : 'Partner offer saved successfully!'
          }
        </SuccessMessage>
      )}

      {activeCategory === 'videos' && (
        <>
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
        </>
      )}

      {activeCategory === 'partners' && (
        <PartnerOffersManagement
          offers={partnerOffers}
          onCreateOffer={handleCreateOffer}
          onEditOffer={handleEditOffer}
          onDeleteOffer={handleDeleteOffer}
          onToggleStatus={handleToggleOfferStatus}
          showForm={showOfferForm}
          editingOffer={editingOffer}
          onSaveOffer={handleSaveOffer}
          onCancelEdit={() => {
            setShowOfferForm(false);
            setEditingOffer(null);
          }}
          onImageUpload={handleImageUpload}
          uploadingImage={uploadingImage}
        />
      )}
    </WebModContainer>
  );
};