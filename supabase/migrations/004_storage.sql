-- Create public bucket for business logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload to their own business folder
CREATE POLICY "logos_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = (
    SELECT business_id::text
    FROM public.business_users
    WHERE user_id = auth.uid()
    LIMIT 1
  )
);

-- Authenticated users can SELECT their own objects (required for upsert)
CREATE POLICY "logos_select_own_policy"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = (
    SELECT business_id::text
    FROM public.business_users
    WHERE user_id = auth.uid()
    LIMIT 1
  )
);

-- Authenticated users can UPDATE their own logos (required for upsert)
CREATE POLICY "logos_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = (
    SELECT business_id::text
    FROM public.business_users
    WHERE user_id = auth.uid()
    LIMIT 1
  )
);

-- Authenticated users can DELETE their own logos
CREATE POLICY "logos_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = (
    SELECT business_id::text
    FROM public.business_users
    WHERE user_id = auth.uid()
    LIMIT 1
  )
);
