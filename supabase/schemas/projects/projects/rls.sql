-- CANONICAL EXPECTED STATE. Read-only DEV catalog reviewed 2026-10-12.
-- Definition for future reconstruction; NOT a migration to run on existing DEV.
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects NO FORCE ROW LEVEL SECURITY;
CREATE POLICY projects_select ON public.projects
  AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (private.is_project_member(id));
