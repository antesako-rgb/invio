REVOKE ALL ON public.seating_templates FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.seating_templates TO authenticated;
GRANT ALL ON public.seating_templates TO service_role;
