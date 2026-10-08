-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create table public.seating_plan_guests (
 project_id uuid not null,
 plan_id uuid not null,
 project_guest_id uuid not null
);
