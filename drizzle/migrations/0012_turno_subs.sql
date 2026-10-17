CREATE TABLE public.turno_subs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE CHECK (char_length(token) BETWEEN 20 AND 4096),
  city text NOT NULL CHECK (city IN ('calama','la-serena','coquimbo')),
  secret text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.turno_subs TO service_role;
ALTER TABLE public.turno_subs ENABLE ROW LEVEL SECURITY;