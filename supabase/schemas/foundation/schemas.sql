-- CANONICAL EXPECTED STATE. Read-only DEV catalog reviewed 2026-10-12.
-- Definition for future reconstruction; NOT a migration to run on existing DEV.
-- public/auth/storage and Supabase roles are platform-managed prerequisites.
CREATE SCHEMA private AUTHORIZATION postgres;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated, service_role;
GRANT ALL ON SCHEMA private TO postgres;
