-- Supabase Database Schema for Twitch OAuth React App

-- Create role enum type
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'modder', 'slotmanager', 'premium', 'user');

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  twitch_id VARCHAR(50) UNIQUE NOT NULL,
  twitch_username VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  profile_image_url TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  twitch_access_token TEXT NOT NULL,
  twitch_refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_twitch_id ON user_profiles(twitch_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles (if not exists)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies

-- Enable RLS on tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);  -- Allow reading all profiles

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (true);  -- Allow updates

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (true);  -- Allow inserts

-- Drop existing session policies if they exist
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON user_sessions;

-- Policies for user_sessions
CREATE POLICY "Users can view sessions" ON user_sessions
  FOR SELECT USING (true);  -- Allow reading sessions

CREATE POLICY "Users can insert sessions" ON user_sessions
  FOR INSERT WITH CHECK (true);  -- Allow session creation

CREATE POLICY "Users can delete sessions" ON user_sessions
  FOR DELETE USING (true);  -- Allow session deletion

-- Optional: Create a view for user stats
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  up.id,
  up.twitch_id,
  up.display_name,
  up.created_at as account_created,
  up.last_login,
  COUNT(us.id) as total_sessions,
  EXTRACT(days FROM (NOW() - up.created_at)) as account_age_days
FROM user_profiles up
LEFT JOIN user_sessions us ON up.id = us.user_id
WHERE up.is_active = true
GROUP BY up.id, up.twitch_id, up.display_name, up.created_at, up.last_login;

-- Grant permissions to authenticated users
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_sessions TO authenticated;
GRANT SELECT ON user_stats TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Role management functions
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

-- Create the trigger for role protection
DROP TRIGGER IF EXISTS prevent_unauthorized_superadmin_assignment_trigger ON user_profiles;
CREATE TRIGGER prevent_unauthorized_superadmin_assignment_trigger
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_unauthorized_superadmin_assignment();