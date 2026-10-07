-- INSTALL: execute ONCE, in numbered order, as postgres.
-- Do NOT execute 001_prepare/002_activate after this install.
begin;

create table private.storage_objects (
  id uuid primary key,
  project_id uuid not null, -- Deliberately NO FK: survives project deletion.
  product_id uuid not null,
  kind text not null check (kind in ('invitation', 'digital-album', 'photo-wall')),
  actor_id uuid,
  storage_key text not null unique,
  state text not null default 'pending'
    check (state in ('pending', 'ready', 'deleting', 'deleted', 'quarantined')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours',
  swept_at timestamptz,
  result jsonb,
  check (storage_key = 'projects/' || project_id::text || '/photos/' || id::text || '.webp')
);

alter table private.storage_objects enable row level security;

create policy deny_clients on private.storage_objects as restrictive for all to public using (false) with check (false);

create index storage_objects_sweep on private.storage_objects(state, expires_at);

revoke all on private.storage_objects from public, anon, authenticated, service_role;

commit;
