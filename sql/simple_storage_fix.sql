-- Simple Storage Policies (Alternative approach)
-- If the above doesn't work, try this simpler version

-- Just disable RLS entirely for the storage.objects table
-- WARNING: This makes ALL storage buckets public - use with caution
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled but make partner-offer-images bucket work:
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- 
-- -- Drop existing policies
-- DROP POLICY IF EXISTS "Allow public access to partner offer images" ON storage.objects;
-- 
-- -- Create a very simple policy
-- CREATE POLICY "Allow all operations on partner offer images" ON storage.objects
--   USING (bucket_id = 'partner-offer-images');