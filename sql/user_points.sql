-- User Points Table
-- Stores StreamElements points for users who connect via Twitch

CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  points_alltime INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- Everyone can view the leaderboard
CREATE POLICY "Anyone can view user points"
  ON user_points
  FOR SELECT
  USING (true);

-- Users can update their own points
CREATE POLICY "Users can update own points"
  ON user_points
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can insert their own points
CREATE POLICY "Users can insert own points"
  ON user_points
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_points_points ON user_points(points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
