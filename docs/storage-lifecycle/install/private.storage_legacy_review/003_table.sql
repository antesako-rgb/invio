-- INSTALL: execute ONCE, in numbered order, as postgres.
-- Do NOT execute 001_prepare/002_activate after this install.
begin;

create table private.storage_legacy_review (
  photo_id uuid primary key,
  project_id uuid not null,
  image_path text not null,
  source_type text not null,
  source_id uuid not null,
  file_size bigint not null,
  captured_at timestamptz not null default now()
);

alter table private.storage_legacy_review enable row level security;

create policy deny_clients on private.storage_legacy_review as restrictive for all to public using (false) with check (false);

revoke all on private.storage_legacy_review from public, anon, authenticated, service_role;

commit;
