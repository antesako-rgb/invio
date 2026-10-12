ALTER TABLE public.seating_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_tables NO FORCE ROW LEVEL SECURITY;
CREATE POLICY seating_tables_member_select ON public.seating_tables FOR SELECT TO authenticated USING (private.is_project_member(project_id));
