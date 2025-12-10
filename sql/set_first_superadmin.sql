-- First Superadmin Setup
-- This bypasses the role protection to set the first superadmin

-- Temporarily disable the trigger
DROP TRIGGER IF EXISTS prevent_unauthorized_superadmin_assignment_trigger ON user_profiles;

-- Set your user as superadmin (replace 'YOUR_TWITCH_USERNAME' with your actual username)
UPDATE user_profiles 
SET role = 'superadmin' 
WHERE twitch_username = 'YOUR_TWITCH_USERNAME';

-- Re-enable the trigger for future protection
CREATE TRIGGER prevent_unauthorized_superadmin_assignment_trigger
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_unauthorized_superadmin_assignment();