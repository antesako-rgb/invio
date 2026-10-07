-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/private.storage_legacy_review/003_table.sql
create table private.storage_legacy_review (
  photo_id uuid primary key,
  project_id uuid not null,
  image_path text not null,
  source_type text not null,
  source_id uuid not null,
  file_size bigint not null,
  captured_at timestamptz not null default now()
);
