-- CANONICAL EXPECTED STATE. Read-only DEV catalog reviewed 2026-10-12.
-- Definition for future reconstruction; NOT a migration to run on existing DEV.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles NO FORCE ROW LEVEL SECURITY;
CREATE POLICY profiles_select ON public.profiles
  AS PERMISSIVE FOR SELECT
  TO authenticated
  USING ((id = auth.uid()));
CREATE POLICY profiles_update ON public.profiles
  AS PERMISSIVE FOR UPDATE
  TO authenticated
  USING ((id = auth.uid()))
  WITH CHECK ((id = auth.uid()));
