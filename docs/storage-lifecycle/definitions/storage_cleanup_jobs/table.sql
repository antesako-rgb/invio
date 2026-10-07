-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/private.storage_cleanup_jobs/002_table.sql
create table private.storage_cleanup_jobs (
  object_id uuid primary key references private.storage_objects(id),
  state text not null default 'pending' check (state in ('pending', 'leased', 'done')),
  lease_token uuid,
  lease_until timestamptz,
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
