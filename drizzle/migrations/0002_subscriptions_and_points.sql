CREATE TABLE public.place_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  place_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, place_id)
);
GRANT SELECT, INSERT, DELETE ON public.place_subscriptions TO authenticated;
GRANT ALL ON public.place_subscriptions TO service_role;
ALTER TABLE public.place_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven sus suscripciones" ON public.place_subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Usuarios se suscriben" ON public.place_subscriptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Usuarios cancelan sus suscripciones" ON public.place_subscriptions FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.cumpita_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  nickname text,
  points integer NOT NULL DEFAULT 0,
  reports_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cumpita_points TO anon;
GRANT SELECT, INSERT, UPDATE ON public.cumpita_points TO authenticated;
GRANT ALL ON public.cumpita_points TO service_role;
ALTER TABLE public.cumpita_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ranking visible para todos" ON public.cumpita_points FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Usuarios crean su puntaje" ON public.cumpita_points FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Usuarios actualizan su puntaje" ON public.cumpita_points FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.place_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  place_id text NOT NULL,
  place_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('open','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.place_alerts TO authenticated;
GRANT ALL ON public.place_alerts TO service_role;
ALTER TABLE public.place_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven sus alertas" ON public.place_alerts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Sistema crea alertas" ON public.place_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios marcan leidas" ON public.place_alerts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());