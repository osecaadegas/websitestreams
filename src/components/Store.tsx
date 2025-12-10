import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../services/supabase';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  image_url: string;
  cost: number;
  stock: number;
}

const StoreContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #fff;
  margin-bottom: 2rem;
  text-align: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 2rem;
  padding: 1rem;
`;

const Card = styled.div`
  position: relative;
  width: 190px;
  height: 254px;
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
    width: 190px;
    height: 260px;
    border-radius: 10px;
    background: linear-gradient(-45deg, #9146ff 0%, #7c2fd1 40%);
    z-index: -10;
    pointer-events: none;
    transition: all 0.8s cubic-bezier(0.175, 0.95, 0.9, 1.275);
    box-shadow: 0px 20px 30px hsla(0, 0%, 0%, 0.521);
  }

  &::after {
    content: "";
    z-index: -1;
    position: absolute;
    inset: 0;
    width: 165px;
    height: 245px;
    background: linear-gradient(-45deg, #9c4bff 0%, #8533ff 100%);
    transform: translate3d(0, 0, 0) scale(0.45);
  }

  &:hover::after {
    transition: all 0.2s cubic-bezier(0.175, 0.285, 0.82, 1.275);
  }

  &:hover::before {
    transform: scaleX(1.02) scaleY(1.02);
    box-shadow: 0px 0px 30px 0px hsla(270, 100%, 50%, 0.356);
  }
`;

const CardImage = styled.div<{ $imageUrl: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background-image: url(${props => props.$imageUrl});
  background-size: cover;
  background-position: center;
  border-radius: 8px 8px 0 0;
  z-index: 1;
`;

const CardContent = styled.div`
  position: relative;
  z-index: 2;
  margin-top: auto;
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

const RedeemButton = styled.button`
  position: relative;
  padding: 12px 24px;
  margin-top: 12px;
  width: 100%;
  font-size: 14px;
  font-weight: bold;
  color: white;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 50px;
  overflow: hidden;
  transition: transform 0.2s ease;
  z-index: 3;

  &:hover {
    transform: scale(1.03);
  }

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      from 0deg,
      #ff6b6b,
      #4ecdc4,
      #45b7d1,
      #96ceb4,
      #feca57,
      #ff9ff3,
      #ff6b6b
    );
    z-index: -2;
    filter: blur(10px);
    transform: rotate(0deg);
    transition: transform 1.5s ease-in-out;
  }

  &:hover::before {
    transform: rotate(180deg);
  }

  &::after {
    content: "";
    position: absolute;
    inset: 2px;
    background: #161616;
    border-radius: 47px;
    z-index: -1;
  }

  &:active {
    transform: scale(0.99);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  &:disabled::before {
    animation: none;
  }
`;

const GradientText = styled.span`
  color: transparent;
  background: conic-gradient(
    from 0deg,
    #ff6b6b,
    #4ecdc4,
    #45b7d1,
    #96ceb4,
    #feca57,
    #ff9ff3,
    #ff6b6b
  );
  background-clip: text;
  -webkit-background-clip: text;
  filter: hue-rotate(0deg);

  ${RedeemButton}:hover & {
    animation: hue-rotating 2s linear infinite;
  }

  @keyframes hue-rotating {
    to {
      filter: hue-rotate(360deg);
    }
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
  font-size: 1.2rem;
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  background: ${props => props.$type === 'success' ? '#48bb78' : '#f56565'};
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

export const Store: React.FC = () => {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);

  useEffect(() => {
    loadItems();
    loadUserPoints();
  }, []);

  const loadItems = async () => {
    try {
      console.log('Loading store items...');
      const { data, error } = await supabase
        .from('store_items')
        .select('*')
        .order('cost', { ascending: true });

      console.log('Store items response:', { data, error });
      
      if (error) throw error;
      setItems(data || []);
      console.log('Items set:', data);
    } catch (error) {
      console.error('Error loading store items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPoints = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Store: Loading points for user:', user?.id);
      if (!user) {
        console.log('Store: No user logged in');
        return;
      }

      const { data, error } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', user.id)
        .single();

      console.log('Store: User points data:', data, 'error:', error);
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Store: No points record found for user, creating one...');
          // User doesn't have points record yet, sync from SE
          const { streamElementsService } = await import('../services/streamElementsService');
          const userProfile = await supabase
            .from('user_profiles')
            .select('twitch_username')
            .eq('id', user.id)
            .single();
          
          if (userProfile.data?.twitch_username) {
            await streamElementsService.syncUserPoints(userProfile.data.twitch_username, user.id);
            // Try loading again
            const { data: newData } = await supabase
              .from('user_points')
              .select('points')
              .eq('user_id', user.id)
              .single();
            setUserPoints(newData?.points || 0);
            console.log('Store: Points after sync:', newData?.points || 0);
          }
        } else {
          throw error;
        }
      } else {
        setUserPoints(data?.points || 0);
        console.log('Store: User has points:', data?.points);
      }
    } catch (error) {
      console.error('Error loading user points:', error);
    }
  };

  const handleRedeem = async (item: StoreItem) => {
    try {
      setRedeeming(item.id);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage({ type: 'error', text: 'Please log in to redeem items' });
        return;
      }

      // Check if user has enough points
      if (userPoints < item.cost) {
        setMessage({ type: 'error', text: 'Not enough points!' });
        return;
      }

      // Check if item is in stock
      if (item.stock <= 0) {
        setMessage({ type: 'error', text: 'Item out of stock!' });
        return;
      }

      // Create redemption record
      const { error: redemptionError } = await supabase
        .from('redemptions')
        .insert({
          user_id: user.id,
          item_id: item.id,
          item_name: item.name,
          item_cost: item.cost,
          status: 'pending'
        });

      if (redemptionError) throw redemptionError;

      // Deduct points from user
      const { error: pointsError } = await supabase
        .from('user_points')
        .update({ points: userPoints - item.cost })
        .eq('user_id', user.id);

      if (pointsError) throw pointsError;

      // Reduce stock
      const { error: stockError } = await supabase
        .from('store_items')
        .update({ stock: item.stock - 1 })
        .eq('id', item.id);

      if (stockError) throw stockError;

      setMessage({ type: 'success', text: 'Item redeemed! Pending admin approval.' });
      setUserPoints(prev => prev - item.cost);
      await loadItems(); // Refresh items to update stock
    } catch (error) {
      console.error('Redemption error:', error);
      setMessage({ type: 'error', text: 'Failed to redeem item' });
    } finally {
      setRedeeming(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) {
    return (
      <StoreContainer>
        <Title>Store</Title>
        <EmptyState>Loading...</EmptyState>
      </StoreContainer>
    );
  }

  const handleManualSync = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userProfile = await supabase
        .from('user_profiles')
        .select('twitch_username')
        .eq('id', user.id)
        .single();
      
      if (userProfile.data?.twitch_username) {
        const { streamElementsService } = await import('../services/streamElementsService');
        const success = await streamElementsService.syncUserPoints(userProfile.data.twitch_username, user.id);
        console.log('Manual sync result:', success);
        if (success) {
          await loadUserPoints();
          setMessage({ type: 'success', text: 'Points synced successfully!' });
        } else {
          setMessage({ type: 'error', text: 'Failed to sync points from StreamElements' });
        }
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Manual sync error:', error);
      setMessage({ type: 'error', text: 'Sync failed' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <StoreContainer>
      <Title>🛒 Store</Title>
      {message && <Message $type={message.type}>{message.text}</Message>}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ color: '#9146ff', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Your Points: {userPoints.toLocaleString()}
        </div>
        <button
          onClick={handleManualSync}
          style={{
            padding: '0.5rem 1rem',
            background: '#9146ff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔄 Sync Points from StreamElements
        </button>
      </div>
      <Grid>
        {items.length === 0 ? (
          <EmptyState>No items available yet. Check back soon!</EmptyState>
        ) : (
          items.map((item) => (
            <Card key={item.id}>
              <CardImage $imageUrl={item.image_url} />
              <CardContent>
                <ItemName>{item.name}</ItemName>
                <ItemDescription>{item.description}</ItemDescription>
                <ItemFooter>
                  <ItemCost>{item.cost} pts</ItemCost>
                  <ItemStock>{item.stock} left</ItemStock>
                </ItemFooter>
                <RedeemButton
                  onClick={() => handleRedeem(item)}
                  disabled={redeeming === item.id || item.stock <= 0 || userPoints < item.cost}
                >
                  <GradientText>
                    {redeeming === item.id ? 'Redeeming...' : item.stock <= 0 ? 'Out of Stock' : 'Redeem'}
                  </GradientText>
                </RedeemButton>
              </CardContent>
            </Card>
          ))
        )}
      </Grid>
    </StoreContainer>
  );
};
