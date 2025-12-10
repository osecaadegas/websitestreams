-- Fix store items access for public viewing
-- Drop existing SELECT policy and recreate it to allow anonymous access

DROP POLICY IF EXISTS "Anyone can view store items" ON store_items;

-- Create new policy that explicitly allows both authenticated and anonymous users
CREATE POLICY "Public read access to store items"
  ON store_items
  FOR SELECT
  TO public
  USING (true);

-- Verify admin policies exist (recreate if needed)
DROP POLICY IF EXISTS "Only admins can insert store items" ON store_items;
DROP POLICY IF EXISTS "Only admins can update store items" ON store_items;
DROP POLICY IF EXISTS "Only admins can delete store items" ON store_items;

CREATE POLICY "Only admins can insert store items"
  ON store_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Only admins can update store items"
  ON store_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Only admins can delete store items"
  ON store_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
    )
  );
