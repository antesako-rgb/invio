-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/private.storage_cleanup_jobs/002_table.sql
alter table private.storage_cleanup_jobs enable row level security;

-- Source: install/private.storage_cleanup_jobs/002_table.sql
create policy deny_clients on private.storage_cleanup_jobs as restrictive for all to public using (false) with check (false);
