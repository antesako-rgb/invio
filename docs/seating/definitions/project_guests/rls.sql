-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
alter table public.project_guests enable row level security;
create policy project_guests_member_select on public.project_guests for select to authenticated using(private.is_project_member(project_id));
