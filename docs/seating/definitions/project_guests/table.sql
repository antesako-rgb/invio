-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create table public.project_guests (
 id uuid not null default gen_random_uuid(),
 project_id uuid not null,
 first_name text not null,
 last_name text,
 notes text,
 archived_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
