-- StreamElements Configuration Table
-- This stores the API credentials for StreamElements integration

CREATE TABLE IF NOT EXISTS streamelements_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id TEXT NOT NULL,
  jwt_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE streamelements_config ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view StreamElements config (needed for API calls)
CREATE POLICY "Authenticated users can view StreamElements config"
  ON streamelements_config
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can update StreamElements config"
  ON streamelements_config
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert StreamElements config"
  ON streamelements_config
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Function to update StreamElements config
CREATE OR REPLACE FUNCTION update_streamelements_config(
  p_channel_id TEXT,
  p_jwt_token TEXT
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Check if config exists
  IF EXISTS (SELECT 1 FROM streamelements_config LIMIT 1) THEN
    -- Update existing config
    UPDATE streamelements_config
    SET 
      channel_id = p_channel_id,
      jwt_token = p_jwt_token,
      updated_at = CURRENT_TIMESTAMP;
  ELSE
    -- Insert new config
    INSERT INTO streamelements_config (channel_id, jwt_token)
    VALUES (p_channel_id, p_jwt_token);
  END IF;

  v_result := json_build_object(
    'success', true,
    'message', 'StreamElements configuration updated successfully'
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    v_result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_streamelements_config TO authenticated;
