ALTER TABLE public.seating_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_elements NO FORCE ROW LEVEL SECURITY;
CREATE POLICY seating_elements_member_select ON public.seating_elements FOR SELECT TO authenticated USING (private.is_project_member(project_id));
