
-- Create a public storage bucket for hero background uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-backgrounds', 'hero-backgrounds', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload hero backgrounds"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hero-backgrounds' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own hero backgrounds"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'hero-backgrounds' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own hero backgrounds"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hero-backgrounds' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access (bucket is public)
CREATE POLICY "Anyone can view hero backgrounds"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hero-backgrounds');
