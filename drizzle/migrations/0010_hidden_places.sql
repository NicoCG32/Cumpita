CREATE TABLE public.hidden_places (
  place_id text PRIMARY KEY,
  place_name text NOT NULL,
  reason text NOT NULL DEFAULT 'closed_permanently',
  hidden_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hidden_places TO anon, authenticated;
GRANT INSERT, DELETE ON public.hidden_places TO authenticated;
GRANT ALL ON public.hidden_places TO service_role;
ALTER TABLE public.hidden_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locales ocultos son públicos" ON public.hidden_places FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins ocultan locales" ON public.hidden_places FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND hidden_by = auth.uid());
CREATE POLICY "Admins reactivan locales" ON public.hidden_places FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));