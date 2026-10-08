CREATE TABLE public.place_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id text NOT NULL CHECK (char_length(place_id) BETWEEN 1 AND 200),
  status text NOT NULL CHECK (status IN ('open','closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX place_reports_created_idx ON public.place_reports (created_at DESC);
GRANT SELECT, INSERT ON public.place_reports TO anon, authenticated;
GRANT ALL ON public.place_reports TO service_role;
ALTER TABLE public.place_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reportes visibles para todos" ON public.place_reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cualquiera puede reportar" ON public.place_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.place_reports;