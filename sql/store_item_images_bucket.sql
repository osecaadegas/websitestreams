-- Create storage bucket for store item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-item-images', 'store-item-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for store item images
-- Allow anyone to read images
CREATE POLICY "Allow public to read store item images"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-item-images');

-- Allow authenticated admins to upload images
CREATE POLICY "Allow admins to upload store item images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'store-item-images' 
  AND auth.uid() IN (
    SELECT id FROM user_profiles 
    WHERE role IN ('superadmin', 'admin')
  )
);

-- Allow authenticated admins to update images
CREATE POLICY "Allow admins to update store item images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'store-item-images'
  AND auth.uid() IN (
    SELECT id FROM user_profiles 
    WHERE role IN ('superadmin', 'admin')
  )
);

-- Allow authenticated admins to delete images
CREATE POLICY "Allow admins to delete store item images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'store-item-images'
  AND auth.uid() IN (
    SELECT id FROM user_profiles 
    WHERE role IN ('superadmin', 'admin')
  )
);
