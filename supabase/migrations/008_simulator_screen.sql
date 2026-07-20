-- Configurable content for the /simular intro screen
ALTER TABLE public.businesses ADD COLUMN simulator_banner_url text;
ALTER TABLE public.businesses ADD COLUMN simulator_headline_1 text;
ALTER TABLE public.businesses ADD COLUMN simulator_headline_2 text;
ALTER TABLE public.businesses ADD COLUMN simulator_results_title text;
ALTER TABLE public.businesses ADD COLUMN simulator_results_description text;
ALTER TABLE public.businesses ADD COLUMN simulator_badge_1 text;
ALTER TABLE public.businesses ADD COLUMN simulator_badge_2 text;
ALTER TABLE public.businesses ADD COLUMN simulator_badge_3 text;
