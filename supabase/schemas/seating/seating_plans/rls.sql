ALTER TABLE public.seating_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_plans NO FORCE ROW LEVEL SECURITY;
CREATE POLICY seating_plans_member_select ON public.seating_plans FOR SELECT TO authenticated USING (private.is_project_member(project_id));
