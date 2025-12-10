-- Create StreamElements connections table (user-specific SE tokens)
-- This matches the ReactOverlay database structure

CREATE TABLE IF NOT EXISTS public.streamelements_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  se_channel_id text NOT NULL,
  se_jwt_token text NOT NULL,
  se_username text NULL,
  connected_at timestamp with time zone NULL DEFAULT now(),
  last_sync timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT streamelements_connections_pkey PRIMARY KEY (id),
  CONSTRAINT streamelements_connections_user_id_key UNIQUE (user_id),
  CONSTRAINT streamelements_connections_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles (id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_se_connections_user_id ON public.streamelements_connections USING btree (user_id) TABLESPACE pg_default;

-- Disable RLS for now (we handle permissions in app)
ALTER TABLE streamelements_connections DISABLE ROW LEVEL SECURITY;

-- Insert your connection data
-- Replace with your actual SE channel ID and JWT token
INSERT INTO streamelements_connections (user_id, se_channel_id, se_jwt_token, se_username)
SELECT 
  id,
  '6651a9aa96734b6b995f7889', -- Your SE channel ID
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9a', -- Your SE JWT token
  twitch_username
FROM user_profiles
WHERE twitch_username = 'osecaadegas95' -- Your username
ON CONFLICT (user_id) DO UPDATE
SET se_channel_id = EXCLUDED.se_channel_id,
    se_jwt_token = EXCLUDED.se_jwt_token,
    se_username = EXCLUDED.se_username,
    last_sync = now();
