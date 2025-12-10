-- Fix storage policies for video-highlights bucket
-- Run this in Supabase SQL Editor

-- Method 1: Try to disable RLS on storage.objects (if you have permissions)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Method 2: Create a very permissive policy
-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "Allow video uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated storage operations" ON storage.objects;
DROP POLICY IF EXISTS "video_highlights_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "video_highlights_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "video_highlights_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "video_highlights_update_policy" ON storage.objects;

-- Create a single permissive policy for the video-highlights bucket
CREATE POLICY "video_highlights_all_operations" ON storage.objects
FOR ALL
USING (bucket_id = 'video-highlights')
WITH CHECK (bucket_id = 'video-highlights');

-- Alternative: If the above doesn't work, try this more permissive version
-- CREATE POLICY "video_highlights_bypass" ON storage.objects
-- FOR ALL
-- USING (true)
-- WITH CHECK (true);