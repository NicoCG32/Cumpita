CREATE TABLE public.place_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id text NOT NULL CHECK (char_length(place_id) BETWEEN 1 AND 200),
  tag text NOT NULL CHECK (tag IN ('cash_only','card_ok','reja','fila','sin_fila')),
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX place_tags_created_idx ON public.place_tags (created_at DESC);
GRANT SELECT, INSERT ON public.place_tags TO anon, authenticated;
GRANT ALL ON public.place_tags TO service_role;
ALTER TABLE public.place_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tags visibles para todos" ON public.place_tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cualquiera agrega tags" ON public.place_tags FOR INSERT TO anon, authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
ALTER PUBLICATION supabase_realtime ADD TABLE public.place_tags;