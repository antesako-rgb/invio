-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
-- EXISTING TABLE: only invitation_guests gains project_guest_id.
create table public.rsvp_response_guests (
 id uuid default gen_random_uuid() not null,
 project_id uuid not null,
 invitation_id uuid not null,
 response_id uuid not null,
 invitation_guest_id uuid,
 status text not null,
 answers jsonb default '{}'::jsonb not null,
 created_at timestamp with time zone default now() not null,
 updated_at timestamp with time zone default now() not null,
 first_name text,
 last_name text
);
