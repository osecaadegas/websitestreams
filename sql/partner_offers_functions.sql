-- Partner Offers Database Schema
-- This SQL file creates tables and functions for managing partner offers

-- Create partner_offers table
CREATE TABLE IF NOT EXISTS partner_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  image_file_path TEXT,
  min_deposit DECIMAL(10,2),
  vpn_friendly BOOLEAN DEFAULT false,
  bonus TEXT,
  cashback TEXT,
  free_spins TEXT,
  deposit_methods TEXT[], -- Array of deposit methods
  withdrawal_methods TEXT[], -- Array of withdrawal methods
  terms_conditions TEXT,
  max_bonus DECIMAL(10,2),
  wagering_requirements TEXT,
  country_restrictions TEXT[],
  affiliate_link TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE partner_offers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active partner offers" ON partner_offers;
DROP POLICY IF EXISTS "Admins can manage partner offers" ON partner_offers;

-- Create policy for reading partner offers (anyone can read active offers)
CREATE POLICY "Anyone can view active partner offers" ON partner_offers
  FOR SELECT USING (is_active = true);

-- Create policy for admin users to manage partner offers
CREATE POLICY "Admins can manage partner offers" ON partner_offers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Create function to upsert partner offer
CREATE OR REPLACE FUNCTION upsert_partner_offer(
  p_title VARCHAR(255),
  p_description TEXT,
  p_id UUID DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_image_file_path TEXT DEFAULT NULL,
  p_min_deposit DECIMAL(10,2) DEFAULT NULL,
  p_vpn_friendly BOOLEAN DEFAULT false,
  p_bonus TEXT DEFAULT NULL,
  p_cashback TEXT DEFAULT NULL,
  p_free_spins TEXT DEFAULT NULL,
  p_deposit_methods TEXT[] DEFAULT NULL,
  p_withdrawal_methods TEXT[] DEFAULT NULL,
  p_terms_conditions TEXT DEFAULT NULL,
  p_max_bonus DECIMAL(10,2) DEFAULT NULL,
  p_wagering_requirements TEXT DEFAULT NULL,
  p_country_restrictions TEXT[] DEFAULT NULL,
  p_affiliate_link TEXT DEFAULT NULL,
  p_is_featured BOOLEAN DEFAULT false,
  p_is_active BOOLEAN DEFAULT true
) 
RETURNS partner_offers
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result partner_offers;
  user_role TEXT;
BEGIN
  -- Check if user has admin permissions
  SELECT role INTO user_role 
  FROM user_profiles 
  WHERE id = auth.uid();
  
  IF user_role NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'Insufficient permissions to manage partner offers';
  END IF;

  -- Insert or update partner offer
  INSERT INTO partner_offers (
    id, title, description, image_url, image_file_path, min_deposit,
    vpn_friendly, bonus, cashback, free_spins, deposit_methods, 
    withdrawal_methods, terms_conditions, max_bonus, wagering_requirements,
    country_restrictions, affiliate_link, is_featured, is_active,
    created_by, updated_by, updated_at
  ) VALUES (
    COALESCE(p_id, gen_random_uuid()),
    p_title, p_description, p_image_url, p_image_file_path, p_min_deposit,
    p_vpn_friendly, p_bonus, p_cashback, p_free_spins, p_deposit_methods,
    p_withdrawal_methods, p_terms_conditions, p_max_bonus, p_wagering_requirements,
    p_country_restrictions, p_affiliate_link, p_is_featured, p_is_active,
    auth.uid(),
    auth.uid(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    image_file_path = EXCLUDED.image_file_path,
    min_deposit = EXCLUDED.min_deposit,
    vpn_friendly = EXCLUDED.vpn_friendly,
    bonus = EXCLUDED.bonus,
    cashback = EXCLUDED.cashback,
    free_spins = EXCLUDED.free_spins,
    deposit_methods = EXCLUDED.deposit_methods,
    withdrawal_methods = EXCLUDED.withdrawal_methods,
    terms_conditions = EXCLUDED.terms_conditions,
    max_bonus = EXCLUDED.max_bonus,
    wagering_requirements = EXCLUDED.wagering_requirements,
    country_restrictions = EXCLUDED.country_restrictions,
    affiliate_link = EXCLUDED.affiliate_link,
    is_featured = EXCLUDED.is_featured,
    is_active = EXCLUDED.is_active,
    updated_by = auth.uid(),
    updated_at = NOW()
  RETURNING * INTO result;

  RETURN result;
END;
$$;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_partner_offers(BOOLEAN);

-- Create function to get all partner offers
CREATE OR REPLACE FUNCTION get_partner_offers(
  p_include_inactive BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  description TEXT,
  image_url TEXT,
  image_file_path TEXT,
  min_deposit DECIMAL(10,2),
  vpn_friendly BOOLEAN,
  bonus TEXT,
  cashback TEXT,
  free_spins TEXT,
  deposit_methods TEXT[],
  withdrawal_methods TEXT[],
  terms_conditions TEXT,
  max_bonus DECIMAL(10,2),
  wagering_requirements TEXT,
  country_restrictions TEXT[],
  affiliate_link TEXT,
  is_featured BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  updated_by UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_include_inactive THEN
    RETURN QUERY 
    SELECT po.* FROM partner_offers po
    ORDER BY po.is_featured DESC, po.created_at DESC;
  ELSE
    RETURN QUERY 
    SELECT po.* FROM partner_offers po
    WHERE po.is_active = true
    ORDER BY po.is_featured DESC, po.created_at DESC;
  END IF;
END;
$$;

-- Create function to delete partner offer
CREATE OR REPLACE FUNCTION delete_partner_offer(
  p_offer_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check if user has admin permissions
  SELECT role INTO user_role 
  FROM user_profiles 
  WHERE id = auth.uid();
  
  IF user_role NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'Insufficient permissions to delete partner offers';
  END IF;

  -- Delete the partner offer
  DELETE FROM partner_offers WHERE id = p_offer_id;
  
  RETURN FOUND;
END;
$$;

-- Create function to toggle partner offer status
CREATE OR REPLACE FUNCTION toggle_partner_offer_status(
  p_offer_id UUID
)
RETURNS partner_offers
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result partner_offers;
  user_role TEXT;
BEGIN
  -- Check if user has admin permissions
  SELECT role INTO user_role 
  FROM user_profiles 
  WHERE id = auth.uid();
  
  IF user_role NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'Insufficient permissions to modify partner offers';
  END IF;

  -- Toggle the active status
  UPDATE partner_offers 
  SET is_active = NOT is_active,
      updated_by = auth.uid(),
      updated_at = NOW()
  WHERE id = p_offer_id
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- Note: Storage bucket will be created automatically by the application
-- This avoids RLS policy conflicts during bucket creation

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Anyone can view partner offer images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload partner offer images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update partner offer images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete partner offer images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update partner offer images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete partner offer images" ON storage.objects;

-- Create storage policies for partner offer images
CREATE POLICY "Anyone can view partner offer images" ON storage.objects
  FOR SELECT USING (bucket_id = 'partner-offer-images');

CREATE POLICY "Authenticated users can upload partner offer images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'partner-offer-images' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Authenticated users can update partner offer images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'partner-offer-images'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Authenticated users can delete partner offer images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'partner-offer-images'
    AND auth.uid() IS NOT NULL
  );