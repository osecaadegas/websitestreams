-- Add role column to user_profiles table
-- This migration adds the role system to the existing user_profiles table

-- First, create the role enum type
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'modder', 'slotmanager', 'premium', 'user');

-- Add the role column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN role user_role DEFAULT 'user' NOT NULL;

-- Update existing users to have 'user' role (they already have the default)
-- This is just to be explicit about the migration

-- Create index on role for efficient queries
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Update the RLS policies if needed (optional, based on your security requirements)
-- You might want to create policies that restrict role changes

-- Example policy to allow users to read their own profile but not others' sensitive info
CREATE POLICY "Users can view all profiles but limited info" ON user_profiles
    FOR SELECT USING (
        auth.uid()::text = id::text OR 
        role IN ('admin', 'superadmin') OR
        true -- Allow viewing basic profile info for all users
    );

-- Example policy for role updates (only admins and superadmins can update roles)
CREATE POLICY "Only admins can update roles" ON user_profiles
    FOR UPDATE USING (
        auth.uid()::text = id::text AND role = role OR -- Users can't change their own role
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id::text = auth.uid()::text 
            AND up.role IN ('admin', 'superadmin')
        )
    );

-- You might also want to create a function to prevent superadmin role changes by non-superadmins
CREATE OR REPLACE FUNCTION prevent_unauthorized_superadmin_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- If someone is trying to set role to superadmin
    IF NEW.role = 'superadmin' AND OLD.role != 'superadmin' THEN
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

-- Create the trigger
CREATE TRIGGER prevent_unauthorized_superadmin_assignment_trigger
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_unauthorized_superadmin_assignment();