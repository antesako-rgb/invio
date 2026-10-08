-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
-- EXISTING TABLE: only invitation_guests gains project_guest_id.
create table public.invitation_recipients (
 id uuid default gen_random_uuid() not null,
 invitation_id uuid not null,
 email text,
 phone text,
 token_hash text not null,
 created_at timestamp with time zone default now() not null,
 updated_at timestamp with time zone default now() not null,
 project_id uuid not null
);
