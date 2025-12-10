-- Create storage bucket for video highlights
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-highlights', 'video-highlights', true);

-- Create policy to allow authenticated users to upload videos
CREATE POLICY "Allow authenticated users to upload videos" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'video-highlights' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow authenticated users to view videos
CREATE POLICY "Allow authenticated users to view videos" ON storage.objects
FOR SELECT TO authenticated USING (
    bucket_id = 'video-highlights'
);

-- Create policy to allow users to delete their own videos
CREATE POLICY "Allow users to delete their own videos" ON storage.objects
FOR DELETE TO authenticated USING (
    bucket_id = 'video-highlights' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow admins to manage all videos
CREATE POLICY "Allow admins to manage all videos" ON storage.objects
FOR ALL TO authenticated USING (
    bucket_id = 'video-highlights' AND
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('superadmin', 'admin')
    )
);