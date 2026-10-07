-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/private.storage_cleanup_jobs/002_table.sql
revoke all on private.storage_cleanup_jobs from public, anon, authenticated, service_role;
