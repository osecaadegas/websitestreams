-- Fix StreamElements config access
-- The table has data but RLS is blocking reads

-- First, check if RLS is enabled
ALTER TABLE streamelements_config DISABLE ROW LEVEL SECURITY;

-- If you want to keep RLS enabled but allow authenticated users to read:
-- ALTER TABLE streamelements_config ENABLE ROW LEVEL SECURITY;
-- 
-- DROP POLICY IF EXISTS "Allow authenticated users to read config" ON streamelements_config;
-- 
-- CREATE POLICY "Allow authenticated users to read config"
-- ON streamelements_config
-- FOR SELECT
-- TO authenticated
-- USING (true);
-- 
-- DROP POLICY IF EXISTS "Allow admins to manage config" ON streamelements_config;
-- 
-- CREATE POLICY "Allow admins to manage config"
-- ON streamelements_config
-- FOR ALL
-- TO authenticated
-- USING (true)
-- WITH CHECK (true);
