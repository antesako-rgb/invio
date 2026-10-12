-- CANONICAL EXPECTED STATE. Read-only DEV catalog reviewed 2026-10-12.
-- Definition for future reconstruction; NOT a migration to run on existing DEV.
-- PostgreSQL 17+ (MAINTAIN privilege); explicit ACL before reconstruction COMMIT.
REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO postgres, service_role;
GRANT SELECT ON TABLE public.profiles TO authenticated;
REVOKE ALL (id, email, first_name, last_name, created_at, updated_at) ON TABLE public.profiles FROM PUBLIC, anon, authenticated, service_role;
GRANT UPDATE (first_name, last_name) ON TABLE public.profiles TO authenticated;
