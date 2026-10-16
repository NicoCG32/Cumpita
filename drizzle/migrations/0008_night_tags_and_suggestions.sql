ALTER TABLE public.place_tags DROP CONSTRAINT IF EXISTS place_tags_tag_check;
ALTER TABLE public.place_tags ADD CONSTRAINT place_tags_tag_check CHECK (tag IN ('cash_only','card_ok','reja','fila','sin_fila','hielo','cigarros','promo'));

CREATE TABLE public.place_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'missing' CHECK (kind IN ('missing','feedback')),
  name text CHECK (name IS NULL OR char_length(name) BETWEEN 1 AND 120),
  category text CHECK (category IS NULL OR category IN ('farmacia','botilleria')),
  city text CHECK (city IS NULL OR char_length(city) <= 60),
  address text CHECK (address IS NULL OR char_length(address) <= 200),
  note text CHECK (note IS NULL OR char_length(note) <= 1000),
  lat double precision,
  lng double precision,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);
GRANT INSERT ON public.place_suggestions TO anon, authenticated;
GRANT SELECT, UPDATE ON public.place_suggestions TO authenticated;
GRANT ALL ON public.place_suggestions TO service_role;
ALTER TABLE public.place_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cualquiera sugiere" ON public.place_suggestions FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND reviewed_at IS NULL AND reviewed_by IS NULL);
CREATE POLICY "Admins ven sugerencias" ON public.place_suggestions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins revisan sugerencias" ON public.place_suggestions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));