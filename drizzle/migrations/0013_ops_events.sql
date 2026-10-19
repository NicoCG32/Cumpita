CREATE TABLE public.ops_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('source','cache','slow','retry','load_error','refresh')),
  source text NOT NULL CHECK (char_length(source) <= 60),
  ok boolean NOT NULL DEFAULT true,
  ms integer CHECK (ms IS NULL OR ms BETWEEN 0 AND 600000),
  detail text CHECK (detail IS NULL OR char_length(detail) <= 200),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ops_events_created_idx ON public.ops_events (created_at DESC);
GRANT ALL ON public.ops_events TO service_role;
GRANT SELECT ON public.ops_events TO authenticated;
ALTER TABLE public.ops_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins ven monitoreo" ON public.ops_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));