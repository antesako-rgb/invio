-- CANONICAL EXPECTED STATE. Read-only DEV catalog reviewed 2026-10-12.
-- Definition for future reconstruction; NOT a migration to run on existing DEV.
-- PostgreSQL 17+ (MAINTAIN privilege); explicit ACL before reconstruction COMMIT.
REVOKE ALL ON TABLE public.projects FROM PUBLIC, anon, authenticated, service_role;
GRANT ALL ON TABLE public.projects TO postgres, service_role;
GRANT SELECT ON TABLE public.projects TO authenticated;
