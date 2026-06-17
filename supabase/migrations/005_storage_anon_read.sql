-- Allow anonymous users to read logo files (public landing page)
CREATE POLICY "logos_anon_read_policy"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'logos');
