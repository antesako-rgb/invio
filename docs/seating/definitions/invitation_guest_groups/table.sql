-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
-- EXISTING TABLE: only invitation_guests gains project_guest_id.
create table public.invitation_guest_groups (
 id uuid default gen_random_uuid() not null,
 project_id uuid not null,
 invitation_id uuid not null,
 name text not null,
 created_at timestamp with time zone default now() not null,
 updated_at timestamp with time zone default now() not null
);
