REVOKE ALL ON public.seating_plans FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.seating_plans TO authenticated;
GRANT ALL ON public.seating_plans TO service_role;
