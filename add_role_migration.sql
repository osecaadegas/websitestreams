-- Migration to add role system to existing user_profiles table
-- Run this FIRST if you already have the user_profiles table created

-- Create the role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'modder', 'slotmanager', 'premium', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add the role column to existing user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user' NOT NULL;

-- Create index on role for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Update existing users to have 'user' role (if they don't already have one)
UPDATE user_profiles SET role = 'user' WHERE role IS NULL;

-- Role management functions
CREATE OR REPLACE FUNCTION prevent_unauthorized_superadmin_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- If someone is trying to set role to superadmin
    IF NEW.role = 'superadmin' AND (OLD.role IS NULL OR OLD.role != 'superadmin') THEN
        -- Check if the user making the change is a superadmin
        IF NOT EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id::text = auth.uid()::text 
            AND role = 'superadmin'
        ) THEN
            RAISE EXCEPTION 'Only superadmins can assign superadmin role';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger for role protection
DROP TRIGGER IF EXISTS prevent_unauthorized_superadmin_assignment_trigger ON user_profiles;
CREATE TRIGGER prevent_unauthorized_superadmin_assignment_trigger
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_unauthorized_superadmin_assignment();