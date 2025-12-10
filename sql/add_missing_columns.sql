-- Add missing columns to video_highlights table
-- Run this first before running video_highlights_functions.sql

-- Add the missing columns for file uploads
ALTER TABLE video_highlights 
ADD COLUMN IF NOT EXISTS video_file_path TEXT,
ADD COLUMN IF NOT EXISTS video_file_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_uploaded_file BOOLEAN DEFAULT FALSE;

-- Also add updated_by if missing
ALTER TABLE video_highlights 
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES user_profiles(id);

-- Check the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'video_highlights' 
ORDER BY ordinal_position;