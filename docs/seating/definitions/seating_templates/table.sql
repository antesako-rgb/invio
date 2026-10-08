-- SAVE/REVIEW ONLY. Proposed definition; not installed. Use numbered install package, not definitions.
create table public.seating_templates (
 id uuid not null default gen_random_uuid(),
 name text not null,
 slug text not null,
 description text,
 document jsonb not null,
 document_version integer not null default 1,
 is_active boolean not null default false,
 sort_order integer not null default 0,
 event_type text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
