-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
alter table public.seating_assignments enable row level security;
create policy seating_assignments_member_select on public.seating_assignments for select to authenticated using(private.is_project_member(project_id));
