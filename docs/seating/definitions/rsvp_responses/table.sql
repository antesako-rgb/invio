-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
-- EXISTING TABLE: only invitation_guests gains project_guest_id.
create table public.rsvp_responses (
 id uuid default gen_random_uuid() not null,
 project_id uuid not null,
 invitation_id uuid not null,
 recipient_id uuid,
 submitted_at timestamp with time zone default now() not null,
 created_at timestamp with time zone default now() not null,
 updated_at timestamp with time zone default now() not null,
 response_type text default 'personalized'::text not null
);
