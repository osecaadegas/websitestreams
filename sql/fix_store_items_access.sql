-- Complete fix for store items access
-- Run this entire file in Supabase SQL Editor

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view store items" ON store_items;
DROP POLICY IF EXISTS "Public read access to store items" ON store_items;
DROP POLICY IF EXISTS "Only admins can insert store items" ON store_items;
DROP POLICY IF EXISTS "Only admins can update store items" ON store_items;
DROP POLICY IF EXISTS "Only admins can delete store items" ON store_items;
DROP POLICY IF EXISTS "Authenticated users can insert store items" ON store_items;
DROP POLICY IF EXISTS "Authenticated users can update store items" ON store_items;
DROP POLICY IF EXISTS "Authenticated users can delete store items" ON store_items;

-- Step 2: Completely disable RLS for store_items
-- We handle permissions in the app layer (WebMod checks admin roles)
ALTER TABLE store_items DISABLE ROW LEVEL SECURITY;

-- Step 6: Create storage bucket for store item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-item-images', 'store-item-images', true)
ON CONFLICT (id) DO NOTHING;

-- Step 7: Drop existing storage policies if any
DROP POLICY IF EXISTS "Allow public to read store item images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to upload store item images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to update store item images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete store item images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload store item images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update store item images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete store item images" ON storage.objects;

-- Step 8: Create storage policies with proper syntax
CREATE POLICY "Allow public to read store item images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'store-item-images');

CREATE POLICY "Authenticated users can upload store item images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'store-item-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update store item images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'store-item-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'store-item-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete store item images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'store-item-images' 
  AND auth.role() = 'authenticated'
);
