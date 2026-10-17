DROP POLICY IF EXISTS "Locales ocultos son públicos" ON public.hidden_places;
CREATE POLICY "Admins ven locales ocultos" ON public.hidden_places FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE OR REPLACE FUNCTION public.get_hidden_place_ids()
RETURNS TABLE(place_id text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT place_id FROM public.hidden_places $$;
REVOKE ALL ON FUNCTION public.get_hidden_place_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_hidden_place_ids() TO anon, authenticated, service_role;