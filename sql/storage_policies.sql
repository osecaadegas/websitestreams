-- Storage Policies for Partner Offer Images
-- This SQL needs to be run by a Supabase administrator/superuser
-- Run this AFTER running partner_offers_functions.sql

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies for partner-offer-images bucket
DROP POLICY IF EXISTS "Public read access for partner offer images" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access for partner offer images" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for partner offer images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for partner offer images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view partner offer images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload partner offer images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update partner offer images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete partner offer images" ON storage.objects;

-- Create new permissive policies for partner-offer-images bucket
CREATE POLICY "Allow public read access to partner offer images" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'partner-offer-images');

CREATE POLICY "Allow authenticated upload to partner offer images" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'partner-offer-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated update to partner offer images" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'partner-offer-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated delete of partner offer images" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'partner-offer-images' 
    AND auth.role() = 'authenticated'
  );

-- Create the bucket if it doesn't exist (this also requires superuser)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partner-offer-images', 
  'partner-offer-images', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;