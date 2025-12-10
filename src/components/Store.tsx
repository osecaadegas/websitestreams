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

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
  font-size: 1.2rem;
`;

export const Store: React.FC = () => {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
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

  if (loading) {
    return (
      <StoreContainer>
        <Title>Store</Title>
        <EmptyState>Loading...</EmptyState>
      </StoreContainer>
    );
  }

  return (
    <StoreContainer>
      <Title>🛒 Store</Title>
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
              </CardContent>
            </Card>
          ))
        )}
      </Grid>
    </StoreContainer>
  );
};
