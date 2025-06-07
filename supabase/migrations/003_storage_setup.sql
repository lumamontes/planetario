-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'video/mp4', 'video/webm']
);

-- Create storage policies for media bucket

-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload their own media files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to view their own files
CREATE POLICY "Users can view their own media files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own media files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own media files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public access to view files (for avatars and public content)
CREATE POLICY "Public can view media files" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Create function to clean up orphaned media files
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_media()
RETURNS void AS $$
BEGIN
  -- Delete media files that are not referenced in any table
  DELETE FROM storage.objects 
  WHERE bucket_id = 'media' 
  AND name NOT IN (
    SELECT DISTINCT avatar_url FROM public.profiles WHERE avatar_url IS NOT NULL
    UNION
    SELECT DISTINCT (content->>'url')::text FROM public.planet_content 
    WHERE content->>'url' IS NOT NULL AND content->>'url' LIKE '%supabase%'
    UNION
    SELECT DISTINCT public_url FROM public.media_files WHERE public_url IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle file cleanup when profile is deleted
CREATE OR REPLACE FUNCTION public.handle_profile_media_cleanup()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete avatar file from storage if it exists
  IF OLD.avatar_url IS NOT NULL AND OLD.avatar_url LIKE '%supabase%' THEN
    -- Extract file path from URL
    DECLARE
      file_path TEXT;
    BEGIN
      file_path := substring(OLD.avatar_url from '/storage/v1/object/public/media/(.*)');
      IF file_path IS NOT NULL THEN
        DELETE FROM storage.objects 
        WHERE bucket_id = 'media' AND name = file_path;
      END IF;
    END;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile cleanup
CREATE TRIGGER handle_profile_media_cleanup_trigger
  BEFORE DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_media_cleanup();

-- Create function to handle media file cleanup when media_files record is deleted
CREATE OR REPLACE FUNCTION public.handle_media_file_cleanup()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete file from storage
  IF OLD.storage_path IS NOT NULL THEN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'media' AND name = OLD.storage_path;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for media files cleanup
CREATE TRIGGER handle_media_file_cleanup_trigger
  BEFORE DELETE ON public.media_files
  FOR EACH ROW EXECUTE FUNCTION public.handle_media_file_cleanup(); 