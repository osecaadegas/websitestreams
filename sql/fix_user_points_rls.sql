-- Temporarily disable RLS on user_points table for testing
-- This allows the StreamElements sync to work without permission issues

ALTER TABLE user_points DISABLE ROW LEVEL SECURITY;
