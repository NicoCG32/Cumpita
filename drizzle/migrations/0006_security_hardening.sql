-- Points: server-derived only
REVOKE INSERT, UPDATE ON public.cumpita_points FROM anon, authenticated;
GRANT INSERT (user_id, nickname) ON public.cumpita_points TO authenticated;
GRANT UPDATE (nickname) ON public.cumpita_points TO authenticated;
DROP POLICY IF EXISTS "Ranking visible para todos" ON public.cumpita_points;
CREATE POLICY "Usuarios ven su puntaje" ON public.cumpita_points FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.award_point()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); n integer;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  SELECT count(*) INTO n FROM public.place_reports WHERE user_id = uid;
  INSERT INTO public.cumpita_points (user_id, nickname, points, reports_count)
  VALUES (uid, 'Cumpita', n, n)
  ON CONFLICT DO NOTHING;
  UPDATE public.cumpita_points SET points = n, reports_count = n, updated_at = now() WHERE user_id = uid;
END $$;
REVOKE EXECUTE ON FUNCTION public.award_point() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_point() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (nickname text, points integer, reports_count integer, is_me boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT nickname, points, reports_count, (user_id = auth.uid()) FROM public.cumpita_points
  ORDER BY points DESC LIMIT 10
$$;
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO anon, authenticated;

-- Reports: ownership + server throttle
DROP POLICY IF EXISTS "Cualquiera puede reportar" ON public.place_reports;
CREATE POLICY "Cualquiera puede reportar" ON public.place_reports FOR INSERT TO anon, authenticated
  WITH CHECK ((user_id IS NULL OR user_id = auth.uid()) AND status IN ('open','closed'));
DROP POLICY IF EXISTS "Reportes visibles para todos" ON public.place_reports;
CREATE POLICY "Reportes recientes visibles" ON public.place_reports FOR SELECT TO anon, authenticated
  USING (created_at > now() - interval '1 day');

CREATE OR REPLACE FUNCTION public.throttle_place_report()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.user_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.place_reports
     WHERE user_id = NEW.user_id AND place_id = NEW.place_id AND created_at > now() - interval '10 minutes') THEN
    RAISE EXCEPTION 'Too many reports';
  END IF;
  NEW.created_at := now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS place_reports_throttle ON public.place_reports;
CREATE TRIGGER place_reports_throttle BEFORE INSERT ON public.place_reports FOR EACH ROW EXECUTE FUNCTION public.throttle_place_report();

-- Alerts: own rows only
DROP POLICY IF EXISTS "Sistema crea alertas" ON public.place_alerts;
CREATE POLICY "Usuarios crean sus alertas" ON public.place_alerts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Tags: only recent ones visible
DROP POLICY IF EXISTS "Tags visibles para todos" ON public.place_tags;
CREATE POLICY "Tags recientes visibles" ON public.place_tags FOR SELECT TO anon, authenticated
  USING (created_at > now() - interval '3 hours');

-- En route: per-device secret
ALTER TABLE public.en_route ADD COLUMN IF NOT EXISTS secret text;
DELETE FROM public.en_route WHERE secret IS NULL;
ALTER TABLE public.en_route ALTER COLUMN secret SET NOT NULL;