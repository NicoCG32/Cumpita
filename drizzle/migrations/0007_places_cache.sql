CREATE TABLE public.places_cache (key text PRIMARY KEY, places jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.places_cache TO service_role;
ALTER TABLE public.places_cache ENABLE ROW LEVEL SECURITY;