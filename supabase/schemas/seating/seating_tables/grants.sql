REVOKE ALL ON public.seating_tables FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.seating_tables TO authenticated;
GRANT ALL ON public.seating_tables TO service_role;
