-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
-- EXISTING TABLE: only invitation_guests gains project_guest_id.
create table public.invitation_guests (
 id uuid default gen_random_uuid() not null,
 project_id uuid not null,
 invitation_id uuid not null,
 recipient_id uuid,
 is_primary boolean default false not null,
 created_at timestamp with time zone default now() not null,
 group_id uuid,
 first_name text not null,
 last_name text,
 notes text,
 updated_at timestamp with time zone default now() not null,
 project_guest_id uuid not null
);
