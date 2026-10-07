-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/private.storage_objects/001_table.sql
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
