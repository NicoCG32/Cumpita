ALTER TABLE public.place_reports ADD COLUMN user_id uuid;
CREATE INDEX place_reports_user_idx ON public.place_reports (user_id, created_at DESC);
COMMENT ON COLUMN public.place_reports.user_id IS 'Usuario que reportó; NULL = reporte anónimo (no suma puntos)';