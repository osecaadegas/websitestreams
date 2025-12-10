-- IMPORTANT: Don't run this SQL file!
-- Instead, configure storage policies through Supabase Dashboard UI

-- FOLLOW THESE STEPS IN SUPABASE DASHBOARD:

-- 1. Go to Storage → Settings → Policies
-- 2. Make sure you have these policies (create them if missing):

-- Policy 1: "Allow authenticated uploads"
-- Operation: INSERT
-- Target: storage.objects
-- Policy Definition: bucket_id = 'video-highlights' AND auth.role() = 'authenticated'

-- Policy 2: "Allow public downloads" 
-- Operation: SELECT
-- Target Roles: authenticated (select this from dropdown)
-- Policy Definition: bucket_id = 'video-highlights'

-- Policy 3: "Allow authenticated deletes"
-- Operation: DELETE
-- Target: storage.objects
-- Policy Definition: bucket_id = 'video-highlights' AND auth.role() = 'authenticated'

-- Policy 4: "Allow authenticated updates"
-- Operation: UPDATE  
-- Target: storage.objects
-- Policy Definition: bucket_id = 'video-highlights' AND auth.role() = 'authenticated'

-- 3. Also check Storage → video-highlights bucket settings:
-- - Make sure "Public bucket" is enabled
-- - File size limit: 100MB
-- - Allowed MIME types: video/mp4, video/webm, video/ogg, video/quicktime

-- IF YOU MUST USE SQL (as service_role), use this instead:
/*
-- Only run this if you have service_role access
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('video-highlights', 'video-highlights', true, 104857600, 
        ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'])
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 104857600,
    allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
*/