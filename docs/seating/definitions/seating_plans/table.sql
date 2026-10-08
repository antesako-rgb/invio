-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create table public.seating_plans (
 id uuid not null default gen_random_uuid(),
 project_id uuid not null,
 name text not null,
 rsvp_invitation_id uuid,
 width_cm integer not null,
 height_cm integer not null,
 revision bigint not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
