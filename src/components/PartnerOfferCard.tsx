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
  width: 100%;
  height: 400px;
  margin-bottom: 2rem;
`;

const CardInner = styled.div<{ $isFlipped: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  transform: ${props => props.$isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  background: linear-gradient(145deg, #2a2a3e 0%, #1e1e2f 100%);
  border: 1px solid rgba(145, 70, 255, 0.2);
  overflow: hidden;
`;

const CardFront = styled(CardFace)`
  display: flex;
  flex-direction: column;
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const OfferImage = styled.div<{ $imageUrl?: string }>`
  height: 180px;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl}) center/cover` 
    : 'linear-gradient(135deg, #9146ff 0%, #6b46c1 100%)'
  };
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%);
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 2;
`;

const CardContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const OfferTitle = styled.h3`
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
`;

const OfferDescription = styled.p`
  color: #b4b4c7;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const OfferDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  text-align: left;
`;

const DetailLabel = styled.span`
  display: block;
  color: #9146ff;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.span`
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
`;

const VpnBadge = styled.div<{ $vpnFriendly: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => props.$vpnFriendly ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  color: ${props => props.$vpnFriendly ? '#10b981' : '#ef4444'};
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #9146ff, #6b46c1);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(145, 70, 255, 0.4);
    }
  ` : `
    background: rgba(145, 70, 255, 0.1);
    color: #9146ff;
    border: 1px solid rgba(145, 70, 255, 0.3);
    
    &:hover {
      background: rgba(145, 70, 255, 0.2);
      border-color: rgba(145, 70, 255, 0.5);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
`;

const BackContent = styled.div`
  color: #ffffff;
`;

const BackTitle = styled.h3`
  color: #9146ff;
  font-size: 1.1rem;
  margin: 0 0 1.5rem 0;
  text-align: center;
`;

const BackSection = styled.div`
  margin-bottom: 1.5rem;
`;

const BackSectionTitle = styled.h4`
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
`;

const MethodsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const MethodTag = styled.span`
  background: rgba(145, 70, 255, 0.2);
  color: #9146ff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const TermsText = styled.p`
  color: #b4b4c7;
  font-size: 0.75rem;
  line-height: 1.4;
  margin: 0;
`;

export const PartnerOfferCard: React.FC<PartnerOfferCardProps> = ({ 
  offer, 
  onClaim 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const imageSource = offer.image_file_path || offer.image_url;
  
  const handleClaim = () => {
    if (offer.affiliate_link) {
      window.open(offer.affiliate_link, '_blank');
    }
    onClaim?.(offer);
  };

  const handleInfoToggle = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <CardContainer>
      <CardInner $isFlipped={isFlipped}>
        <CardFront>
          <OfferImage $imageUrl={imageSource}>
            {offer.is_featured && <FeaturedBadge>★ Featured</FeaturedBadge>}
          </OfferImage>
          
          <CardContent>
            <div>
              <OfferTitle>{offer.title}</OfferTitle>
              <OfferDescription>{offer.description}</OfferDescription>
              
              <VpnBadge $vpnFriendly={offer.vpn_friendly}>
                {offer.vpn_friendly ? '✅ VPN Friendly' : '❌ No VPN'}
              </VpnBadge>
              
              <OfferDetails>
                {offer.min_deposit && (
                  <DetailItem>
                    <DetailLabel>Min Deposit</DetailLabel>
                    <DetailValue>${offer.min_deposit}</DetailValue>
                  </DetailItem>
                )}
                
                {offer.bonus && (
                  <DetailItem>
                    <DetailLabel>Bonus</DetailLabel>
                    <DetailValue>{offer.bonus}</DetailValue>
                  </DetailItem>
                )}
                
                {offer.cashback && (
                  <DetailItem>
                    <DetailLabel>Cashback</DetailLabel>
                    <DetailValue>{offer.cashback}</DetailValue>
                  </DetailItem>
                )}
                
                {offer.free_spins && (
                  <DetailItem>
                    <DetailLabel>Free Spins</DetailLabel>
                    <DetailValue>{offer.free_spins}</DetailValue>
                  </DetailItem>
                )}
              </OfferDetails>
            </div>
            
            <CardActions>
              <ActionButton $variant="secondary" onClick={handleInfoToggle}>
                Info
              </ActionButton>
              <ActionButton $variant="primary" onClick={handleClaim}>
                Claim Offer
              </ActionButton>
            </CardActions>
          </CardContent>
        </CardFront>
        
        <CardBack>
          <BackContent>
            <BackTitle>Offer Details</BackTitle>
            
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
            
            {(offer.wagering_requirements || offer.max_bonus) && (
              <BackSection>
                <BackSectionTitle>Bonus Terms</BackSectionTitle>
                {offer.max_bonus && (
                  <p style={{ color: '#b4b4c7', fontSize: '0.8rem', margin: '0 0 0.5rem 0' }}>
                    Max Bonus: ${offer.max_bonus}
                  </p>
                )}
                {offer.wagering_requirements && (
                  <p style={{ color: '#b4b4c7', fontSize: '0.8rem', margin: 0 }}>
                    Wagering: {offer.wagering_requirements}
                  </p>
                )}
              </BackSection>
            )}
            
            {offer.terms_conditions && (
              <BackSection>
                <BackSectionTitle>Terms & Conditions</BackSectionTitle>
                <TermsText>{offer.terms_conditions}</TermsText>
              </BackSection>
            )}
          </BackContent>
          
          <CardActions>
            <ActionButton $variant="secondary" onClick={handleInfoToggle}>
              Back
            </ActionButton>
            <ActionButton $variant="primary" onClick={handleClaim}>
              Claim Offer
            </ActionButton>
          </CardActions>
        </CardBack>
      </CardInner>
    </CardContainer>
  );
};