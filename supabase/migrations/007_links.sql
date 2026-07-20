-- Optional link-in-bio fields for the public landing page
ALTER TABLE public.businesses ADD COLUMN instagram_url text;
ALTER TABLE public.businesses ADD COLUMN tiktok_url text;
ALTER TABLE public.businesses ADD COLUMN facebook_url text;
ALTER TABLE public.businesses ADD COLUMN website_url text;
ALTER TABLE public.businesses ADD COLUMN maps_url text;
