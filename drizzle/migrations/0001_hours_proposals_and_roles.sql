CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
CREATE POLICY "Usuarios ven sus roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.hours_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id text NOT NULL CHECK (char_length(place_id) BETWEEN 1 AND 200),
  place_name text NOT NULL CHECK (char_length(place_name) BETWEEN 1 AND 200),
  weekday_open text NOT NULL CHECK (weekday_open ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  weekday_close text NOT NULL CHECK (weekday_close ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  weekend_open text NOT NULL CHECK (weekend_open ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  weekend_close text NOT NULL CHECK (weekend_close ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  evidence_url text CHECK (evidence_url IS NULL OR (char_length(evidence_url) <= 500 AND evidence_url ~ '^https?://')),
  evidence_note text NOT NULL CHECK (char_length(evidence_note) BETWEEN 5 AND 1000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);
CREATE INDEX hours_proposals_place_idx ON public.hours_proposals (place_id, reviewed_at DESC);
GRANT SELECT, INSERT ON public.hours_proposals TO anon;
GRANT SELECT, INSERT, UPDATE ON public.hours_proposals TO authenticated;
GRANT ALL ON public.hours_proposals TO service_role;
ALTER TABLE public.hours_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cualquiera propone horarios" ON public.hours_proposals FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND reviewed_at IS NULL AND reviewed_by IS NULL);
CREATE POLICY "Horarios aprobados son públicos" ON public.hours_proposals FOR SELECT TO anon, authenticated
  USING (status = 'approved');
CREATE POLICY "Admins ven todas las propuestas" ON public.hours_proposals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins revisan propuestas" ON public.hours_proposals FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));