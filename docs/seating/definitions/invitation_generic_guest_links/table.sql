-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create table public.invitation_generic_guest_links (
 project_id uuid not null,
 invitation_id uuid not null,
 response_id uuid not null,
 response_guest_id uuid not null,
 project_guest_id uuid not null,
 created_at timestamptz not null default now()
);
