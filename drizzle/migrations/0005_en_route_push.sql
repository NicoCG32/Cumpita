CREATE TABLE public.en_route (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL CHECK (char_length(token) BETWEEN 20 AND 4096),
  place_id text NOT NULL CHECK (char_length(place_id) BETWEEN 1 AND 200),
  place_name text NOT NULL CHECK (char_length(place_name) BETWEEN 1 AND 200),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '45 minutes',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.en_route TO service_role;
ALTER TABLE public.en_route ENABLE ROW LEVEL SECURITY;
CREATE INDEX en_route_place_idx ON public.en_route (place_id, expires_at);