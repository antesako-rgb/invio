-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create index seating_plan_guests_project_idx on public.seating_plan_guests(project_id);
create index seating_plan_guests_person_idx on public.seating_plan_guests(project_guest_id);
