-- INSTALL: execute ONCE, in numbered order, as postgres.
-- Do NOT execute 001_prepare/002_activate after this install.
begin;

create table private.storage_cleanup_jobs (
  object_id uuid primary key references private.storage_objects(id),
  state text not null default 'pending' check (state in ('pending', 'leased', 'done')),
  lease_token uuid,
  lease_until timestamptz,
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table private.storage_cleanup_jobs enable row level security;

create policy deny_clients on private.storage_cleanup_jobs as restrictive for all to public using (false) with check (false);

create index storage_cleanup_due on private.storage_cleanup_jobs(state, next_attempt_at);

revoke all on private.storage_cleanup_jobs from public, anon, authenticated, service_role;

commit;
