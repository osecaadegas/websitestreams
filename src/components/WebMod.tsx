import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { usePermissions } from './RoleGuard';
import { useAuth } from '../context/AuthContext';
import { videoHighlightsService, VideoHighlight } from '../services/videoHighlightsService';
import { partnerOffersService, PartnerOffer, PartnerOfferInput } from '../services/partnerOffersService';
import { slotsService, Slot, SlotInput, SlotProvider } from '../services/slotsService';
import { supabase } from '../services/supabase';

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
  position: relative;
`;

const CompactFormGroup = styled.div`
  margin-bottom: 0.75rem;
  position: relative;
`;

const Label = styled.label`
  display: block;
  color: #e2e8f0;
  font-weight: 600;
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
`;

const RequiredLabel = styled(Label)`
  &::after {
    content: ' *';
    color: #f56565;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid rgba(145, 70, 255, 0.2);
  background: rgba(0, 0, 0, 0.2);
  color: #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #9146ff;
    box-shadow: 0 0 0 3px rgba(145, 70, 255, 0.1);
    background: rgba(0, 0, 0, 0.3);
  }

  &::placeholder {
    color: #718096;
    font-style: italic;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid rgba(145, 70, 255, 0.2);
  border-radius: 8px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;
  max-height: 120px;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.2);
  color: #e2e8f0;
  backdrop-filter: blur(10px);
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #9146ff;
    box-shadow: 0 0 0 3px rgba(145, 70, 255, 0.1);
    background: rgba(0, 0, 0, 0.3);
  }

  &::placeholder {
    color: #718096;
    font-style: italic;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(145, 70, 255, 0.1);
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    transform: translate(-50%, -50%);
  }
  
  &:hover::before {
    width: 300px;
    height: 300px;
  }
  
  span {
    position: relative;
    z-index: 1;
  }
  
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
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 0;
  max-width: 900px;
  width: 95%;
  max-height: 95vh;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(145, 70, 255, 0.2);
`;

const FormHeader = styled.div`
  background: linear-gradient(135deg, #9146ff 0%, #667eea 100%);
  padding: 1.5rem 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translate(-10px, -10px); }
    50% { transform: translate(10px, 10px); }
  }
`;

const FormTitle = styled.h3`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 1;
  
  &::before {
    content: '🎯';
    font-size: 1.2rem;
  }
`;

const FormSubtitle = styled.p`
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 0.9rem;
  position: relative;
  z-index: 1;
`;

const FormBody = styled.div`
  padding: 2rem;
  max-height: calc(95vh - 140px);
  overflow-y: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #9146ff, #667eea);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #7c3aed, #5b21b6);
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const FormCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(145, 70, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(145, 70, 255, 0.3);
    box-shadow: 0 8px 25px rgba(145, 70, 255, 0.1);
  }
`;

const CardTitle = styled.h4`
  color: #e2e8f0;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    width: 3px;
    height: 16px;
    background: linear-gradient(135deg, #9146ff, #667eea);
    border-radius: 2px;
    content: '';
  }
`;

const CompactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ImageUploadArea = styled.div`
  border: 2px dashed rgba(145, 70, 255, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(145, 70, 255, 0.05);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(from 0deg, transparent, rgba(145, 70, 255, 0.1), transparent);
    animation: rotate 3s linear infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    border-color: #9146ff;
    background: rgba(145, 70, 255, 0.1);
    
    &::before {
      opacity: 1;
    }
  }
  
  @keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e2e8f0;
  font-size: 0.85rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  
  &:hover {
    background: rgba(145, 70, 255, 0.1);
    border-color: rgba(145, 70, 255, 0.3);
  }
  
  input[type="checkbox"] {
    margin: 0;
    accent-color: #9146ff;
  }
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(145, 70, 255, 0.1);
`;

const ToggleItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e2e8f0;
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: #9146ff;
  }
  
  input[type="checkbox"] {
    margin: 0;
    accent-color: #9146ff;
  }
`;

// Modern Slot Card Styled Components
const SlotsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const SlotCard = styled.div<{ $active: boolean }>`
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid ${props => props.$active ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  height: 280px;
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 16px 48px rgba(145, 70, 255, 0.3);
    border-color: #9146ff;
  }
`;

const SlotImageContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(145, 70, 255, 0.1), rgba(102, 126, 234, 0.1));
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, 
      transparent 0%, 
      rgba(0, 0, 0, 0.4) 50%,
      rgba(0, 0, 0, 0.85) 100%
    );
    pointer-events: none;
    z-index: 1;
  }
`;

const SlotImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${SlotCard}:hover & {
    transform: scale(1.1);
  }
`;

const SlotImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #9146ff;
  background: linear-gradient(135deg, rgba(145, 70, 255, 0.15), rgba(102, 126, 234, 0.15));
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, rgba(145, 70, 255, 0.3) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
  }
`;

const SlotCardBody = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 2;
`;

const SlotName = styled.h4`
  color: #ffffff;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
`;

const SlotProviderBadge = styled.p`
  color: #ffffff;
  margin: 0;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(145, 70, 255, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(145, 70, 255, 0.5);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  align-self: flex-start;
`;

const SlotActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const SlotActionBtn = styled.button<{ $variant: 'edit' | 'toggle' | 'delete' }>`
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.4s ease, height 0.4s ease;
  }
  
  &:hover::before {
    width: 200%;
    height: 200%;
  }
  
  span {
    position: relative;
    z-index: 1;
  }
  
  ${props => {
    switch (props.$variant) {
      case 'edit':
        return `
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3));
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.4);
          
          &:hover {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.4));
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
            transform: translateY(-2px);
          }
        `;
      case 'toggle':
        return `
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3));
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.4);
          
          &:hover {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.4));
            box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
            transform: translateY(-2px);
          }
        `;
      case 'delete':
        return `
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3));
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.4);
          
          &:hover {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(220, 38, 38, 0.4));
            box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
            transform: translateY(-2px);
          }
        `;
    }
  }}
`;

// Store Item Styled Components
const Card = styled.div`
  position: relative;
  width: 100%;
  height: 280px;
  background: linear-gradient(-45deg, #161616 0%, #000000 100%);
  color: #818181;
  display: flex;
  flex-direction: column;
  justify-content: end;
  padding: 14px;
  gap: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    left: 0;
    margin: auto;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    background: linear-gradient(-45deg, #9146ff 0%, #7c2fd1 40%);
    z-index: -10;
    pointer-events: none;
    transition: all 0.8s cubic-bezier(0.175, 0.95, 0.9, 1.275);
    box-shadow: 0px 20px 30px hsla(0, 0%, 0%, 0.521);
  }

  &:hover::before {
    transform: scaleX(1.02) scaleY(1.02);
    box-shadow: 0px 0px 30px 0px hsla(270, 100%, 50%, 0.356);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
`;

const ItemName = styled.h3`
  font-size: 18px;
  font-weight: 900;
  color: #fff;
  margin: 0 0 5px 0;
  text-transform: capitalize;
`;

const ItemDescription = styled.p`
  font-size: 12px;
  color: #a0aec0;
  margin: 0 0 10px 0;
  line-height: 1.3;
`;

const ItemFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`;

const ItemCost = styled.span`
  font-size: 18px;
  color: #9146ff;
  font-weight: 900;
`;

const ItemStock = styled.span`
  font-size: 12px;
  color: #718096;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ActionButton = styled(Button)`
  background: linear-gradient(135deg, #9146ff, #7c2fd1);
  
  &:hover {
    background: linear-gradient(135deg, #a05aff, #8d3ee0);
  }
`;

const FormOverlay = styled.div`
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
  padding: 2rem;
`;

const FormContainer = styled.div`
  background: #1a1a2e;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #2d3748;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h3 {
    color: #fff;
    margin: 0;
    font-size: 1.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #fff;
  }
`;

const FormField = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    color: #a0aec0;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input, textarea {
    width: 100%;
    padding: 0.75rem;
    background: #0f0f23;
    border: 1px solid #2d3748;
    border-radius: 8px;
    color: #fff;
    font-size: 1rem;
    transition: border-color 0.2s;
    
    &:focus {
      outline: none;
      border-color: #9146ff;
    }
    
    &::placeholder {
      color: #4a5568;
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 80px;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const SecondaryButton = styled(Button)`
  background: #2d3748;
  
  &:hover {
    background: #4a5568;
  }
`;

const SaveButton = styled(Button)`
  background: linear-gradient(135deg, #9146ff, #7c2fd1);
  
  &:hover {
    background: linear-gradient(135deg, #a05aff, #8d3ee0);
  }
`;

const PAYMENT_METHODS = [
  'MBway', 'Crypto', 'Revolut', 'Skrill', 'PaySafeCard', 
  'Bank Transfer', 'Visa', 'Apple Pay', 'Google Pay', 'Neteller', 'Mastercard', 'Binance', 'Multibanco'
];

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
        // Set the image_url field which is used by the card component
        handleInputChange('image_url', imageUrl);
        handleInputChange('image_file_path', imageUrl); // Keep for backwards compatibility
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

  const togglePaymentMethod = (field: 'deposit_methods' | 'withdrawal_methods', method: string) => {
    const currentArray = formData[field] || [];
    const isSelected = currentArray.includes(method);
    
    if (isSelected) {
      handleInputChange(field, currentArray.filter(m => m !== method));
    } else {
      handleInputChange(field, [...currentArray, method]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <FormModal onClick={onCancel}>
      <FormContainer onClick={e => e.stopPropagation()}>
        <FormHeader>
          <FormTitle>
            {offer.id ? 'Edit Partner Offer' : 'Create New Partner Offer'}
          </FormTitle>
          <FormSubtitle>
            {offer.id ? 'Update your partner offer details' : 'Add a new partner offer to showcase'}
          </FormSubtitle>
        </FormHeader>
        
        <FormBody>
          <form onSubmit={handleSubmit}>
          <FormCard>
            <CardTitle>📝 Basic Information</CardTitle>
            <FormGrid>
              <CompactFormGroup>
                <RequiredLabel>Title</RequiredLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter offer title"
                  required
                />
              </CompactFormGroup>

              <CompactFormGroup>
                <Label>Min Deposit ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.min_deposit || ''}
                  onChange={(e) => handleInputChange('min_deposit', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0.00"
                />
              </CompactFormGroup>
            </FormGrid>
            
            <CompactFormGroup>
              <RequiredLabel>Description</RequiredLabel>
              <TextArea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the offer in detail"
                rows={3}
                required
              />
            </CompactFormGroup>
            
            <CompactFormGroup>
              <Label>Affiliate Link</Label>
              <Input
                type="url"
                value={formData.affiliate_link || ''}
                onChange={(e) => handleInputChange('affiliate_link', e.target.value)}
                placeholder="https://affiliate-link.com"
              />
            </CompactFormGroup>
          </FormCard>

          <FormCard>
            <CardTitle>🎰 Rewards & Bonuses</CardTitle>
            <CompactGrid>
              <CompactFormGroup>
                <Label>Bonus</Label>
                <Input
                  value={formData.bonus || ''}
                  onChange={(e) => handleInputChange('bonus', e.target.value)}
                  placeholder="e.g., 100% up to $500"
                />
              </CompactFormGroup>

              <CompactFormGroup>
                <Label>Max Bonus ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.max_bonus || ''}
                  onChange={(e) => handleInputChange('max_bonus', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0.00"
                />
              </CompactFormGroup>

              <CompactFormGroup>
                <Label>Cashback</Label>
                <Input
                  value={formData.cashback || ''}
                  onChange={(e) => handleInputChange('cashback', e.target.value)}
                  placeholder="e.g., 10% daily"
                />
              </CompactFormGroup>

              <CompactFormGroup>
                <Label>Free Spins</Label>
                <Input
                  value={formData.free_spins || ''}
                  onChange={(e) => handleInputChange('free_spins', e.target.value)}
                  placeholder="e.g., 50 free spins"
                />
              </CompactFormGroup>
            </CompactGrid>
          </FormCard>

          <FormCard>
            <CardTitle>🖼️ Image Upload</CardTitle>
            <ImageUploadArea>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload" style={{ cursor: 'pointer', display: 'block', position: 'relative', zIndex: 2 }}>
                {uploadingImage ? (
                  <p style={{ color: '#9146ff', margin: 0 }}>⏳ Uploading...</p>
                ) : formData.image_url || formData.image_file_path ? (
                  <div>
                    <p style={{ color: '#10b981', margin: '0 0 0.5rem 0' }}>
                      ✅ Image uploaded successfully
                    </p>
                    <p style={{ color: '#a0aec0', fontSize: '0.8rem', margin: 0 }}>
                      Click to replace image
                    </p>
                  </div>
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
          </FormCard>

          <FormCard>
            <CardTitle>⚙️ Settings</CardTitle>
            <ToggleGroup>
              <ToggleItem>
                <input
                  type="checkbox"
                  checked={formData.vpn_friendly}
                  onChange={(e) => handleInputChange('vpn_friendly', e.target.checked)}
                />
                🛡️ VPN Friendly
              </ToggleItem>
              <ToggleItem>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                />
                ⭐ Featured Offer
              </ToggleItem>
              <ToggleItem>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                />
                ✅ Active
              </ToggleItem>
            </ToggleGroup>
          </FormCard>

          <FormCard>
            <CardTitle>💳 Payment Methods</CardTitle>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <Label style={{ marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                💰 Deposit Methods
              </Label>
              <CheckboxGrid>
                {PAYMENT_METHODS.map(method => (
                  <CheckboxItem key={method}>
                    <input
                      type="checkbox"
                      checked={(formData.deposit_methods || []).includes(method)}
                      onChange={() => togglePaymentMethod('deposit_methods', method)}
                    />
                    {method}
                  </CheckboxItem>
                ))}
              </CheckboxGrid>
            </div>

            <div>
              <Label style={{ marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                💸 Withdrawal Methods
              </Label>
              <CheckboxGrid>
                {PAYMENT_METHODS.map(method => (
                  <CheckboxItem key={method}>
                    <input
                      type="checkbox"
                      checked={(formData.withdrawal_methods || []).includes(method)}
                      onChange={() => togglePaymentMethod('withdrawal_methods', method)}
                    />
                    {method}
                  </CheckboxItem>
                ))}
              </CheckboxGrid>
            </div>
          </FormCard>

            <ButtonGroup>
              <Button type="button" onClick={onCancel}>
                <span>❌ Cancel</span>
              </Button>
              <Button type="submit" $variant="primary">
                <span>💾 {offer.id ? 'Update' : 'Create'} Offer</span>
              </Button>
            </ButtonGroup>
          </form>
        </FormBody>
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

// Slot Database Management Component
interface SlotsDatabaseManagementProps {
  slots: Slot[];
  providers: SlotProvider[];
  filters: { search: string; provider: string };
  onFiltersChange: (filters: { search: string; provider: string }) => void;
  onCreateSlot: () => void;
  onEditSlot: (slot: Slot) => void;
  onDeleteSlot: (slotId: string) => void;
  onToggleSlotStatus: (slotId: string) => void;
  onImportSlots: () => void;
  showForm: boolean;
  editingSlot: SlotInput | null;
  onSaveSlot: (slot: SlotInput) => void;
  onCancelEdit: () => void;
  stats: { totalSlots: number; activeSlots: number; totalProviders: number };
  importing: boolean;
}

const SlotsDatabaseManagement: React.FC<SlotsDatabaseManagementProps> = ({
  slots,
  providers,
  filters,
  onFiltersChange,
  onCreateSlot,
  onEditSlot,
  onDeleteSlot,
  onToggleSlotStatus,
  onImportSlots,
  showForm,
  editingSlot,
  onSaveSlot,
  onCancelEdit,
  stats,
  importing
}) => {
  const [formData, setFormData] = useState<SlotInput>(editingSlot || { name: '', provider: '', image_url: '', is_active: true });

  useEffect(() => {
    if (editingSlot) {
      setFormData(editingSlot);
    }
  }, [editingSlot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSlot(formData);
  };

  const handleInputChange = (field: keyof SlotInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(145, 70, 255, 0.1)', border: '1px solid rgba(145, 70, 255, 0.3)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎰</div>
          <h3 style={{ color: '#9146ff', margin: '0 0 0.5rem 0' }}>{stats.totalSlots}</h3>
          <p style={{ color: '#a0aec0', margin: 0, fontSize: '0.9rem' }}>Total Slots</p>
        </div>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <h3 style={{ color: '#10b981', margin: '0 0 0.5rem 0' }}>{stats.activeSlots}</h3>
          <p style={{ color: '#a0aec0', margin: 0, fontSize: '0.9rem' }}>Active Slots</p>
        </div>
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏢</div>
          <h3 style={{ color: '#f59e0b', margin: '0 0 0.5rem 0' }}>{stats.totalProviders}</h3>
          <p style={{ color: '#a0aec0', margin: 0, fontSize: '0.9rem' }}>Providers</p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <Input
          placeholder="Search slots..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select
          value={filters.provider}
          onChange={(e) => onFiltersChange({ ...filters, provider: e.target.value })}
          style={{ 
            padding: '0.7rem 0.9rem', 
            background: 'rgba(0, 0, 0, 0.2)', 
            border: '1px solid rgba(145, 70, 255, 0.2)', 
            borderRadius: '8px', 
            color: '#e2e8f0',
            minWidth: '150px'
          }}
        >
          <option value="">All Providers</option>
          {providers.map(provider => (
            <option key={provider.provider} value={provider.provider}>{provider.provider}</option>
          ))}
        </select>
        <Button $variant="primary" onClick={onCreateSlot}>
          ➕ Add Slot
        </Button>
        <Button 
          $variant="secondary" 
          onClick={onImportSlots}
          disabled={importing}
          style={{ opacity: importing ? 0.6 : 1 }}
        >
          {importing ? '📥 Importing...' : '📥 Import Database'}
        </Button>
      </div>

      {/* Inline Add/Edit Slot Form */}
      {showForm && editingSlot && (
        <div style={{ 
          background: 'rgba(145, 70, 255, 0.1)', 
          border: '1px solid rgba(145, 70, 255, 0.3)', 
          borderRadius: '12px', 
          padding: '1.5rem', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '1rem' }}>
            {editingSlot.name ? '✏️ Edit Slot' : '➕ Add New Slot'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <FormGroup style={{ margin: 0 }}>
                <Label>Slot Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter slot name"
                  required
                />
              </FormGroup>

              <FormGroup style={{ margin: 0 }}>
                <Label>Provider *</Label>
                <Input
                  value={formData.provider}
                  onChange={(e) => handleInputChange('provider', e.target.value)}
                  placeholder="Enter provider name"
                  required
                />
              </FormGroup>

              <FormGroup style={{ margin: 0 }}>
                <Label>Image URL</Label>
                <Input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </FormGroup>

              <FormGroup style={{ margin: 0 }}>
                <Label>Status</Label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0', cursor: 'pointer', padding: '0.7rem 0' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    style={{ accentColor: '#9146ff' }}
                  />
                  ✅ Active
                </label>
              </FormGroup>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button type="button" onClick={onCancelEdit}>
                ❌ Cancel
              </Button>
              <Button type="submit" $variant="primary">
                💾 {editingSlot.name ? 'Update' : 'Create'} Slot
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Slots Grid */}
      <SlotsGrid>
        {slots.map((slot) => (
          <SlotCard key={slot.id} $active={slot.is_active}>
            <SlotImageContainer>
              {slot.image_url ? (
                <SlotImage 
                  src={slot.image_url} 
                  alt={slot.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://i.imgur.com/8E3ucNx.png';
                  }}
                />
              ) : (
                <SlotImagePlaceholder>
                  🎰
                </SlotImagePlaceholder>
              )}
            </SlotImageContainer>
            <SlotCardBody>
              <SlotName>{slot.name}</SlotName>
              <SlotProviderBadge>{slot.provider}</SlotProviderBadge>
              <SlotActions>
                <SlotActionBtn
                  $variant="edit"
                  onClick={() => onEditSlot(slot)}
                >
                  <span>✏️</span>
                </SlotActionBtn>
                <SlotActionBtn
                  $variant="toggle"
                  onClick={() => onToggleSlotStatus(slot.id)}
                >
                  <span>{slot.is_active ? '⏸️' : '▶️'}</span>
                </SlotActionBtn>
                <SlotActionBtn
                  $variant="delete"
                  onClick={() => onDeleteSlot(slot.id)}
                >
                  <span>🗑️</span>
                </SlotActionBtn>
              </SlotActions>
            </SlotCardBody>
          </SlotCard>
        ))}
      </SlotsGrid>

    </div>
  );
};

interface StoreItem {
  id?: string;
  name: string;
  description: string;
  image_url: string;
  cost: number;
  stock: number;
}

export const WebMod: React.FC = () => {
  const { hasPermission } = usePermissions();
  const { user, isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'videos' | 'partners' | 'slotdb' | 'store'>('videos');
  const [videos, setVideos] = useState<VideoHighlight[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<Set<number>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<Map<number, number>>(new Map());
  const [videoModes, setVideoModes] = useState<Map<number, 'url' | 'upload'>>(new Map());
  
  // Partner offers state
  const [partnerOffers, setPartnerOffers] = useState<PartnerOffer[]>([]);
  const [editingOffer, setEditingOffer] = useState<PartnerOfferInput | null>(null);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Slots state
  const [slots, setSlots] = useState<Slot[]>([]);
  const [providers, setProviders] = useState<SlotProvider[]>([]);
  const [slotFilters, setSlotFilters] = useState({ search: '', provider: '' });
  const [editingSlot, setEditingSlot] = useState<SlotInput | null>(null);
  const [showSlotForm, setShowSlotForm] = useState(false);

  // Store items state
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [editingStoreItem, setEditingStoreItem] = useState<StoreItem | null>(null);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [loadingStore, setLoadingStore] = useState(false);
  const [slotStats, setSlotStats] = useState<{
    totalSlots: number;
    activeSlots: number;
    totalProviders: number;
    topProviders: Array<{ provider: string; count: number }>;
  }>({ totalSlots: 0, activeSlots: 0, totalProviders: 0, topProviders: [] });
  const [importingSlots, setImportingSlots] = useState(false);
  
  // Track if initial load has been done to prevent infinite loops
  const loadedCategories = useRef<Set<string>>(new Set());

  // Debug logging (commented out for production)
  // console.log('WebMod - User:', user);
  // console.log('WebMod - isAuthenticated:', isAuthenticated);
  // console.log('WebMod - hasPermission:', hasPermission('canManageUsers'));

  // Slots Functions
  const loadSlots = useCallback(async (filters?: { search?: string; provider?: string }) => {
    try {
      setLoadingSlots(true);
      setError(null);
      
      // Use passed filters or current state
      const searchFilter = filters?.search ?? slotFilters.search;
      const providerFilter = filters?.provider ?? slotFilters.provider;
      
      // Load slots data - services handle errors silently now
      const slotsData = await slotsService.getSlots({
        search: searchFilter || undefined,
        provider: providerFilter || undefined,
        activeOnly: false
      });
      
      const providersData = await slotsService.getProviders();
      const statsData = await slotsService.getSlotStats();
      
      setSlots(slotsData);
      setProviders(providersData);
      setSlotStats(statsData);
    } catch (err) {
      // Services handle errors silently - just set empty data
      setSlots([]);
      setProviders([]);
      setSlotStats({
        totalSlots: 0,
        activeSlots: 0,
        totalProviders: 0,
        topProviders: []
      });
    } finally {
      setLoadingSlots(false);
    }
  }, [slotFilters.search, slotFilters.provider]);

  const handleCreateSlot = () => {
    setEditingSlot(slotsService.createEmptySlot());
    setShowSlotForm(true);
  };

  const handleEditSlot = (slot: Slot) => {
    setEditingSlot({
      name: slot.name,
      provider: slot.provider,
      image_url: slot.image_url || '',
      is_active: slot.is_active
    });
    setShowSlotForm(true);
  };

  const handleSaveSlot = async (slot: SlotInput) => {
    try {
      const result = await slotsService.upsertSlot(slot);
      if (result.success) {
        setShowSlotForm(false);
        setEditingSlot(null);
        loadSlots();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to save slot');
      }
    } catch (err) {
      setError('Failed to save slot');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    
    try {
      const result = await slotsService.deleteSlot(slotId);
      if (result.success) {
        loadSlots();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to delete slot');
      }
    } catch (err) {
      setError('Failed to delete slot');
    }
  };

  const handleToggleSlotStatus = async (slotId: string) => {
    try {
      const result = await slotsService.toggleSlotStatus(slotId);
      if (result.success) {
        loadSlots();
      } else {
        setError(result.error || 'Failed to toggle slot status');
      }
    } catch (err) {
      setError('Failed to toggle slot status');
    }
  };

  const handleCancelSlotEdit = () => {
    setShowSlotForm(false);
    setEditingSlot(null);
  };

  const handleImportSlots = async () => {
    // Dynamic import to avoid TypeScript issues
    const { slotDatabase } = await import('../data/slotDatabase.js');
    if (!confirm(`This will import ${slotDatabase.length} slots from the database. Continue?`)) return;
    
    try {
      setImportingSlots(true);
      const result = await slotsService.bulkImportSlots(slotDatabase);
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        loadSlots();
        alert(`Successfully imported ${result.insertedCount} new slots!`);
      } else {
        setError(result.error || 'Failed to import slots');
      }
    } catch (err) {
      setError('Failed to import slots');
    } finally {
      setImportingSlots(false);
    }
  };

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
    const categoryKey = `${activeCategory}-initial`;
    
    // Only load once per category
    if (!loadedCategories.current.has(categoryKey)) {
      loadedCategories.current.add(categoryKey);
      
      if (activeCategory === 'videos') {
        loadVideoHighlights();
      } else if (activeCategory === 'partners' && hasPermission('canManageUsers')) {
        loadPartnerOffers();
      } else if (activeCategory === 'slotdb' && hasPermission('canManageUsers')) {
        loadSlots();
      } else if (activeCategory === 'store' && hasPermission('canManageUsers')) {
        loadStoreItems();
      }
    }
  }, [activeCategory, hasPermission, loadSlots]);

  // Filter slots client-side instead of reloading from server
  const filteredSlots = slots.filter(slot => {
    const matchesSearch = !slotFilters.search || 
      slot.name.toLowerCase().includes(slotFilters.search.toLowerCase()) ||
      slot.provider.toLowerCase().includes(slotFilters.search.toLowerCase());
    const matchesProvider = !slotFilters.provider || slot.provider === slotFilters.provider;
    return matchesSearch && matchesProvider;
  });

  const loadVideoHighlights = useCallback(async () => {
    try {
      setLoadingVideos(true);
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
      setLoadingVideos(false);
    }
  }, []);

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
  const loadPartnerOffers = useCallback(async () => {
    try {
      setLoadingPartners(true);
      const offers = await partnerOffersService.getPartnerOffers(true);
      setPartnerOffers(offers);
    } catch (err) {
      // Service handles errors silently - just set empty array
      setPartnerOffers([]);
    } finally {
      setLoadingPartners(false);
    }
  }, []);

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
      console.log('WebMod: Starting image upload for file:', file.name);
      const imageUrl = await partnerOffersService.uploadOfferImage(file, offerId);
      console.log('WebMod: Image upload successful, URL:', imageUrl);
      return imageUrl;
    } catch (err) {
      console.error('WebMod: Failed to upload image:', err);
      // Show user-friendly error
      setError(`Failed to upload image: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setUploadingImage(false);
    }
  };

  // Store Items Functions
  const loadStoreItems = useCallback(async () => {
    try {
      setLoadingStore(true);
      const { data, error } = await supabase
        .from('store_items')
        .select('*')
        .order('cost', { ascending: true });
      
      if (error) throw error;
      setStoreItems(data || []);
    } catch (err) {
      console.error('Failed to load store items:', err);
      setStoreItems([]);
    } finally {
      setLoadingStore(false);
    }
  }, []);

  const handleCreateStoreItem = () => {
    setEditingStoreItem({
      name: '',
      description: '',
      image_url: '',
      cost: 0,
      stock: 0
    });
    setShowStoreForm(true);
  };

  const handleEditStoreItem = (item: StoreItem) => {
    setEditingStoreItem({ ...item });
    setShowStoreForm(true);
  };

  const handleSaveStoreItem = async () => {
    if (!editingStoreItem) return;

    try {
      const { error } = await supabase
        .from('store_items')
        .upsert(editingStoreItem);

      if (error) throw error;

      await loadStoreItems();
      setShowStoreForm(false);
      setEditingStoreItem(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(`Failed to save store item: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeleteStoreItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('store_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      await loadStoreItems();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(`Failed to delete store item: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Check which category is loading
  const isLoading = (activeCategory === 'videos' && loadingVideos) ||
                    (activeCategory === 'partners' && loadingPartners) ||
                    (activeCategory === 'slotdb' && loadingSlots) ||
                    (activeCategory === 'store' && loadingStore);

  if (isLoading) {
    const loadingMessage = activeCategory === 'videos' 
      ? 'Loading Video Highlights...' 
      : activeCategory === 'partners'
      ? 'Loading Partner Offers...'
      : 'Loading Slot Database...';
      
    return (
      <WebModContainer>
        <div style={{ textAlign: 'center', padding: '60px', color: '#a0aec0' }}>
          <h2 style={{ color: '#e2e8f0' }}>{loadingMessage}</h2>
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
        <TabButton 
          $active={activeCategory === 'slotdb'} 
          onClick={() => setActiveCategory('slotdb')}
        >
          🎰 Slot DB
        </TabButton>
        <TabButton 
          $active={activeCategory === 'store'} 
          onClick={() => setActiveCategory('store')}
        >
          🛒 Store Items
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
            : activeCategory === 'partners'
            ? 'Partner offer saved successfully!'
            : activeCategory === 'store'
            ? 'Store item saved successfully!'
            : 'Slot database updated successfully!'
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

      {activeCategory === 'slotdb' && (
        <>  
          {slots.length === 0 && providers.length === 0 && !loadingSlots && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              borderRadius: '12px', 
              padding: '2rem', 
              textAlign: 'center' as const,
              marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
              <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>Database Not Set Up</h3>
              <p style={{ color: '#fca5a5', marginBottom: '1.5rem' }}>
                The slots database schema hasn't been created yet. Please run the SQL schema in your Supabase project first.
              </p>
              <div style={{ 
                background: 'rgba(0, 0, 0, 0.2)', 
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px', 
                padding: '1rem', 
                textAlign: 'left' as const,
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                color: '#fca5a5'
              }}>
                <strong>Steps to fix:</strong><br/>
                1. Go to your Supabase project dashboard<br/>
                2. Navigate to SQL Editor<br/>
                3. Copy and run the SQL from: sql/slot_database_functions.sql<br/>
                4. Refresh this page
              </div>
            </div>
          )}
          <SlotsDatabaseManagement
            slots={filteredSlots}
            providers={providers}
            filters={slotFilters}
            onFiltersChange={setSlotFilters}
            onCreateSlot={handleCreateSlot}
            onEditSlot={handleEditSlot}
            onDeleteSlot={handleDeleteSlot}
            onToggleSlotStatus={handleToggleSlotStatus}
            onImportSlots={handleImportSlots}
            showForm={showSlotForm}
            editingSlot={editingSlot}
            onSaveSlot={handleSaveSlot}
            onCancelEdit={handleCancelSlotEdit}
            stats={slotStats}
            importing={importingSlots}
          />
        </>
      )}

      {activeCategory === 'store' && (
        <>
          <ActionBar>
            <ActionButton onClick={handleCreateStoreItem}>
              ➕ Create Store Item
            </ActionButton>
          </ActionBar>

          {showStoreForm && editingStoreItem && (
            <FormOverlay>
              <FormContainer>
                <FormHeader>
                  <h3>{editingStoreItem.id ? 'Edit Store Item' : 'Create Store Item'}</h3>
                  <CloseButton onClick={() => {
                    setShowStoreForm(false);
                    setEditingStoreItem(null);
                  }}>✕</CloseButton>
                </FormHeader>
                
                <FormField>
                  <label>Item Name *</label>
                  <input
                    type="text"
                    value={editingStoreItem.name}
                    onChange={(e) => setEditingStoreItem({ ...editingStoreItem, name: e.target.value })}
                    placeholder="e.g., VIP Discord Role"
                  />
                </FormField>

                <FormField>
                  <label>Description *</label>
                  <textarea
                    value={editingStoreItem.description}
                    onChange={(e) => setEditingStoreItem({ ...editingStoreItem, description: e.target.value })}
                    placeholder="Brief description of the item"
                    rows={3}
                  />
                </FormField>

                <FormField>
                  <label>Image URL *</label>
                  <input
                    type="url"
                    value={editingStoreItem.image_url}
                    onChange={(e) => setEditingStoreItem({ ...editingStoreItem, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </FormField>

                <FormRow>
                  <FormField style={{ flex: 1 }}>
                    <label>Cost (Points) *</label>
                    <input
                      type="number"
                      min="0"
                      value={editingStoreItem.cost}
                      onChange={(e) => setEditingStoreItem({ ...editingStoreItem, cost: parseInt(e.target.value) || 0 })}
                    />
                  </FormField>

                  <FormField style={{ flex: 1 }}>
                    <label>Stock *</label>
                    <input
                      type="number"
                      min="0"
                      value={editingStoreItem.stock}
                      onChange={(e) => setEditingStoreItem({ ...editingStoreItem, stock: parseInt(e.target.value) || 0 })}
                    />
                  </FormField>
                </FormRow>

                <FormActions>
                  <SecondaryButton onClick={() => {
                    setShowStoreForm(false);
                    setEditingStoreItem(null);
                  }}>
                    Cancel
                  </SecondaryButton>
                  <SaveButton onClick={handleSaveStoreItem}>
                    {editingStoreItem.id ? 'Update Item' : 'Create Item'}
                  </SaveButton>
                </FormActions>
              </FormContainer>
            </FormOverlay>
          )}

          <Grid style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {storeItems.map((item) => (
              <div key={item.id} style={{ position: 'relative' }}>
                <Card 
                  style={{
                    width: '100%',
                    height: '280px',
                    backgroundImage: `linear-gradient(to bottom, transparent 50%, rgba(22, 22, 22, 0.95) 100%), url(${item.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 2 }}>
                    <ItemName>{item.name}</ItemName>
                    <ItemDescription>{item.description}</ItemDescription>
                    <ItemFooter>
                      <ItemCost>{item.cost} pts</ItemCost>
                      <ItemStock>{item.stock} left</ItemStock>
                    </ItemFooter>
                  </div>
                </Card>
                <div style={{ 
                  position: 'absolute', 
                  top: '10px', 
                  right: '10px', 
                  display: 'flex', 
                  gap: '5px',
                  zIndex: 10
                }}>
                  <ActionButton
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                    onClick={() => handleEditStoreItem(item)}
                  >
                    ✏️
                  </ActionButton>
                  <ActionButton
                    style={{ 
                      padding: '5px 10px', 
                      fontSize: '12px', 
                      background: '#ef4444'
                    }}
                    onClick={() => handleDeleteStoreItem(item.id!)}
                  >
                    🗑️
                  </ActionButton>
                </div>
              </div>
            ))}
          </Grid>
        </>
      )}
    </WebModContainer>
  );
};