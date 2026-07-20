-- Add banner_url to businesses
ALTER TABLE public.businesses ADD COLUMN banner_url text;

-- Create public bucket for business banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload to their own business folder
CREATE POLICY "banners_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'banners'
  AND (storage.foldername(name))[1] = (
    SELECT business_id::text
    FROM public.business_users
    WHERE user_id = auth.uid()
    LIMIT 1
  )
);

-- Authenticated users can SELECT their own objects (required for upsert)
CREATE POLICY "banners_select_own_policy"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'banners'
  AND (storage.foldername(name))[1] = (
    SELECT business_id::text
    FROM public.business_users
    WHERE user_id = auth.uid()
    LIMIT 1
  )
);

-- Authenticated users can UPDATE their own banners (required for upsert)
CREATE POLICY "banners_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'banners'
  AND (storage.foldername(name))[1] = (
    SELECT business_id::text
    FROM public.business_users
    WHERE user_id = auth.uid()
    LIMIT 1
  )
);

-- Authenticated users can DELETE their own banners
CREATE POLICY "banners_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'banners'
  AND (storage.foldername(name))[1] = (
    SELECT business_id::text
    FROM public.business_users
    WHERE user_id = auth.uid()
    LIMIT 1
  )
);

-- Allow anonymous users to read banner files (public landing page)
CREATE POLICY "banners_anon_read_policy"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'banners');
