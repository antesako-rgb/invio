ALTER TABLE public.seating_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_templates NO FORCE ROW LEVEL SECURITY;
CREATE POLICY seating_templates_select ON public.seating_templates FOR SELECT TO authenticated USING ((is_active = true));
