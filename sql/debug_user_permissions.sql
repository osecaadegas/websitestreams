-- Check your user's role and fix video upload issues
-- Run this in Supabase SQL Editor

-- First, check what role your user has
SELECT id, twitch_username, role 
FROM user_profiles 
WHERE twitch_username ILIKE '%oseca%' OR twitch_username ILIKE '%your_username%';

-- Also check all users to find your account
SELECT id, twitch_username, role, created_at 
FROM user_profiles 
ORDER BY created_at DESC;

-- If your user doesn't have admin role, update it:
-- Replace 'your-actual-user-id' with your real user ID from the query above
/*
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'your-actual-user-id';
*/

-- Also check if the video_highlights table exists and has data
SELECT * FROM video_highlights LIMIT 5;

-- The function doesn't exist! Let's create it:
-- Function to update or insert video highlight (upsert)
CREATE OR REPLACE FUNCTION upsert_video_highlight(
    p_slot_number INTEGER,
    p_title VARCHAR(200),
    p_description TEXT,
    p_url TEXT,
    p_updated_by UUID,
    p_video_file_path TEXT DEFAULT NULL,
    p_video_file_name VARCHAR(255) DEFAULT NULL,
    p_file_size BIGINT DEFAULT NULL,
    p_mime_type VARCHAR(100) DEFAULT NULL,
    p_is_uploaded_file BOOLEAN DEFAULT FALSE,
    p_duration VARCHAR(20) DEFAULT '0:15',
    p_views VARCHAR(20) DEFAULT '1.2K'
)
RETURNS BOOLEAN AS $$
DECLARE
    updater_role user_role;
BEGIN
    -- Check if updater has admin permissions
    SELECT role INTO updater_role 
    FROM user_profiles 
    WHERE id = p_updated_by;
    
    IF updater_role NOT IN ('superadmin', 'admin') THEN
        RAISE EXCEPTION 'Insufficient permissions to update video highlights';
    END IF;
    
    -- Validate slot number
    IF p_slot_number < 1 OR p_slot_number > 12 THEN
        RAISE EXCEPTION 'Slot number must be between 1 and 12';
    END IF;
    
    -- Upsert the video highlight
    INSERT INTO video_highlights (
        slot_number,
        title,
        description,
        url,
        video_file_path,
        video_file_name,
        file_size,
        mime_type,
        is_uploaded_file,
        duration,
        views,
        updated_by,
        updated_at
    ) VALUES (
        p_slot_number,
        p_title,
        p_description,
        p_url,
        p_video_file_path,
        p_video_file_name,
        p_file_size,
        p_mime_type,
        p_is_uploaded_file,
        p_duration,
        p_views,
        p_updated_by,
        NOW()
    )
    ON CONFLICT (slot_number) 
    DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        url = EXCLUDED.url,
        video_file_path = EXCLUDED.video_file_path,
        video_file_name = EXCLUDED.video_file_name,
        file_size = EXCLUDED.file_size,
        mime_type = EXCLUDED.mime_type,
        is_uploaded_file = EXCLUDED.is_uploaded_file,
        duration = EXCLUDED.duration,
        views = EXCLUDED.views,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if the test worked
SELECT * FROM video_highlights WHERE slot_number = 1;