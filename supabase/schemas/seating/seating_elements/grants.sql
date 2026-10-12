REVOKE ALL ON public.seating_elements FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.seating_elements TO authenticated;
