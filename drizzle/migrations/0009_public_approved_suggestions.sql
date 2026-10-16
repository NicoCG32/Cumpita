GRANT SELECT ON public.place_suggestions TO anon;
CREATE POLICY "Locales aprobados son públicos" ON public.place_suggestions FOR SELECT TO anon, authenticated
  USING (status = 'approved' AND kind = 'missing' AND lat IS NOT NULL AND lng IS NOT NULL);