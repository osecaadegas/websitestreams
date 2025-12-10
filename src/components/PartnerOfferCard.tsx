import React, { useState } from 'react';
import styled from 'styled-components';

interface PartnerOffer {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  image_file_path?: string;
  min_deposit?: number;
  vpn_friendly: boolean;
  bonus?: string;
  cashback?: string;
  free_spins?: string;
  deposit_methods?: string[];
  withdrawal_methods?: string[];
  terms_conditions?: string;
  max_bonus?: number;
  wagering_requirements?: string;
  country_restrictions?: string[];
  affiliate_link?: string;
  is_featured: boolean;
  is_active: boolean;
}

interface PartnerOfferCardProps {
  offer: PartnerOffer;
  onClaim?: (offer: PartnerOffer) => void;
}

const CardContainer = styled.div`
  perspective: 1000px;
  width: 280px;
  height: 480px;
  margin: 0 auto 2rem auto;
`;

const CardInner = styled.div<{ $isFlipped: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  transform: ${props => props.$isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const CardFront = styled(CardFace)`
  background: linear-gradient(145deg, #2a2d3a 0%, #1a1d28 100%);
  border: 2px solid #ffa500;
  display: flex;
  flex-direction: column;
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
  background: linear-gradient(145deg, #2a2d3a 0%, #1a1d28 100%);
  border: 2px solid #ffa500;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

// Top Badge Styles - Diagonal Ribbon
const TopBadge = styled.div<{ $type: 'premium' | 'hot' | 'instant' | 'featured' }>`
  position: absolute;
  top: 15px;
  right: -30px;
  padding: 6px 40px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 10;
  transform: rotate(45deg);
  transform-origin: center;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    right: 0;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
  }
  
  ${props => {
    switch (props.$type) {
      case 'premium':
        return `
          background: linear-gradient(135deg, #ff6b35, #ff4500);
          &::before { border-top: 6px solid #cc3600; }
          &::after { border-top: 6px solid #cc3600; }
        `;
      case 'hot':
        return `
          background: linear-gradient(135deg, #ff4500, #dc2626);
          &::before { border-top: 6px solid #b91c1c; }
          &::after { border-top: 6px solid #b91c1c; }
        `;
      case 'instant':
        return `
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          &::before { border-top: 6px solid #1e40af; }
          &::after { border-top: 6px solid #1e40af; }
        `;
      case 'featured':
        return `
          background: linear-gradient(135deg, #10b981, #059669);
          &::before { border-top: 6px solid #047857; }
          &::after { border-top: 6px solid #047857; }
        `;
      default:
        return `
          background: linear-gradient(135deg, #f59e0b, #d97706);
          &::before { border-top: 6px solid #b45309; }
          &::after { border-top: 6px solid #b45309; }
        `;
    }
  }}
`;

// Header Section
const CardHeader = styled.div`
  height: 140px;
  position: relative;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;

const BrandLogo = styled.div<{ $hasImage: boolean; $imageUrl?: string }>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  background: transparent;
  
  ${props => props.$hasImage && props.$imageUrl ? `
    img {
      width: 110%;
      height: 110%;
      object-fit: cover;
      transform: scale(1.1);
    }
  ` : `
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #1a1d28;
    font-weight: 800;
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  `}
`;

const DescriptionArea = styled.div`
  padding: 12px 20px 8px 20px;
  text-align: center;
`;

const BrandName = styled.h3`
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-align: center;
`;

const Description = styled.p`
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const VpnStatus = styled.div<{ $vpnFriendly: boolean }>`
  position: absolute;
  bottom: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  z-index: 5;
  backdrop-filter: blur(8px);
  
  span {
    color: ${props => props.$vpnFriendly ? '#10b981' : '#ef4444'};
  }
  
  background: ${props => props.$vpnFriendly ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  border: 1px solid ${props => props.$vpnFriendly ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'};
  
  &::before {
    content: '${props => props.$vpnFriendly ? '✅' : '❌'}';
    margin-right: 4px;
  }
`;

// Stats Grid
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 20px 12px 20px;
  flex: 1;
`;

const StatBox = styled.div`
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 14px 12px;
  text-align: center;
`;

const StatLabel = styled.div`
  color: #94a3b8;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const StatValue = styled.div`
  color: #fbbf24;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
`;

// Action Buttons
const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  padding: 0 16px 16px 16px;
  margin-top: auto;
`;

const ActionButton = styled.button<{ $variant: 'info' | 'claim' }>`
  flex: 1;
  padding: 14px 20px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  ${props => props.$variant === 'info' ? `
    background: linear-gradient(135deg, rgba(71, 85, 105, 0.8), rgba(51, 65, 85, 0.9));
    color: #e2e8f0;
    border: 2px solid rgba(148, 163, 184, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    
    &:hover {
      background: linear-gradient(135deg, rgba(71, 85, 105, 0.9), rgba(51, 65, 85, 1));
      border-color: rgba(148, 163, 184, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
      color: #ffffff;
    }
  ` : `
    background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706);
    color: #1a1d28;
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(251, 191, 36, 0.5);
      background: linear-gradient(135deg, #fcd34d, #fbbf24, #f59e0b);
    }
  `}
  
  &:active {
    transform: translateY(-1px);
    transition-duration: 0.1s;
  }
`;
// Back Card Styles
const BackContent = styled.div`
  color: #ffffff;
  flex: 1;
`;

const BackTitle = styled.h3`
  color: #fbbf24;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 24px 0;
  text-align: center;
`;

const BackSection = styled.div`
  margin-bottom: 20px;
`;

const BackSectionTitle = styled.h4`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MethodsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const MethodTag = styled.span`
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid rgba(251, 191, 36, 0.3);
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const InfoItem = styled.div`
  background: rgba(15, 23, 42, 0.4);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
`;

const InfoLabel = styled.div`
  color: #94a3b8;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
`;

const TermsText = styled.p`
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.4;
  margin: 0;
  background: rgba(15, 23, 42, 0.4);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
`;

export const PartnerOfferCard: React.FC<PartnerOfferCardProps> = ({ 
  offer, 
  onClaim 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Prioritize image_url (from upload) over image_file_path
  const imageSource = offer.image_url || offer.image_file_path;
  
  const handleClaim = () => {
    if (offer.affiliate_link) {
      window.open(offer.affiliate_link, '_blank');
    }
    onClaim?.(offer);
  };

  const handleInfoToggle = () => {
    setIsFlipped(!isFlipped);
  };

  // Determine badge type based on offer properties
  const getBadgeType = () => {
    if (offer.is_featured) return 'premium';
    if (offer.free_spins) return 'hot';
    if (offer.vpn_friendly) return 'instant';
    return 'featured';
  };

  const getBadgeText = () => {
    if (offer.is_featured) return 'Premium';
    if (offer.free_spins) return 'Hot';
    if (offer.vpn_friendly) return 'Instant Withdrawls';
    return 'Featured';
  };

  // Parse numeric values for better display
  const formatCurrency = (value: number) => {
    if (value < 1) return `${(value * 100).toFixed(0)}¢`;
    return `${value.toFixed(0)}€`;
  };

  const formatPercentage = (text: string) => {
    const match = text.match(/(\d+)/);
    return match ? `${match[1]}%` : text;
  };

  const formatSpins = (text: string) => {
    const match = text.match(/(\d+)/);
    return match ? match[1] : text;
  };

  return (
    <CardContainer>
      <CardInner $isFlipped={isFlipped}>
        <CardFront>
          <TopBadge $type={getBadgeType()}>
            {getBadgeText()}
          </TopBadge>
          
          <CardHeader>
            <BrandLogo $hasImage={!!imageSource} $imageUrl={imageSource}>
              {imageSource ? (
                <img src={imageSource} alt={offer.title} />
              ) : (
                offer.title
              )}
            </BrandLogo>
            <VpnStatus $vpnFriendly={offer.vpn_friendly}>
              <span>{offer.vpn_friendly ? 'VPN OK' : 'NO VPN'}</span>
            </VpnStatus>
          </CardHeader>
          
          <DescriptionArea>
            <Description>{offer.description}</Description>
          </DescriptionArea>
          
          <StatsGrid>
            {offer.min_deposit && (
              <StatBox>
                <StatLabel>Min. Deposit</StatLabel>
                <StatValue>{formatCurrency(offer.min_deposit)}</StatValue>
              </StatBox>
            )}
            
            {offer.cashback && (
              <StatBox>
                <StatLabel>Cashback</StatLabel>
                <StatValue>{formatPercentage(offer.cashback)}</StatValue>
              </StatBox>
            )}
            
            {offer.bonus && (
              <StatBox>
                <StatLabel>Bonus Value</StatLabel>
                <StatValue>{formatPercentage(offer.bonus)}</StatValue>
              </StatBox>
            )}
            
            {offer.free_spins && (
              <StatBox>
                <StatLabel>Free Spins</StatLabel>
                <StatValue>{formatSpins(offer.free_spins)}</StatValue>
              </StatBox>
            )}
          </StatsGrid>
          
          <ButtonGroup>
            <ActionButton $variant="info" onClick={handleInfoToggle}>
              More Info
            </ActionButton>
            <ActionButton $variant="claim" onClick={handleClaim}>
              Claim Bonus
            </ActionButton>
          </ButtonGroup>
        </CardFront>
        
        <CardBack>
          <BackContent>
            <BackTitle>Detailed Information</BackTitle>
            
            {(offer.max_bonus || offer.wagering_requirements) && (
              <InfoGrid>
                {offer.max_bonus && (
                  <InfoItem>
                    <InfoLabel>Max Bonus</InfoLabel>
                    <InfoValue>{formatCurrency(offer.max_bonus)}</InfoValue>
                  </InfoItem>
                )}
                {offer.wagering_requirements && (
                  <InfoItem>
                    <InfoLabel>Wagering</InfoLabel>
                    <InfoValue>{offer.wagering_requirements}</InfoValue>
                  </InfoItem>
                )}
              </InfoGrid>
            )}
            
            {offer.deposit_methods && offer.deposit_methods.length > 0 && (
              <BackSection>
                <BackSectionTitle>Deposit Methods</BackSectionTitle>
                <MethodsList>
                  {offer.deposit_methods.map((method, index) => (
                    <MethodTag key={index}>{method}</MethodTag>
                  ))}
                </MethodsList>
              </BackSection>
            )}
            
            {offer.withdrawal_methods && offer.withdrawal_methods.length > 0 && (
              <BackSection>
                <BackSectionTitle>Withdrawal Methods</BackSectionTitle>
                <MethodsList>
                  {offer.withdrawal_methods.map((method, index) => (
                    <MethodTag key={index}>{method}</MethodTag>
                  ))}
                </MethodsList>
              </BackSection>
            )}
            
            {offer.terms_conditions && (
              <BackSection>
                <BackSectionTitle>Terms & Conditions</BackSectionTitle>
                <TermsText>{offer.terms_conditions}</TermsText>
              </BackSection>
            )}
          </BackContent>
          
          <ButtonGroup>
            <ActionButton $variant="info" onClick={handleInfoToggle}>
              Back
            </ActionButton>
            <ActionButton $variant="claim" onClick={handleClaim}>
              Claim Bonus
            </ActionButton>
          </ButtonGroup>
        </CardBack>
      </CardInner>
    </CardContainer>
  );
};