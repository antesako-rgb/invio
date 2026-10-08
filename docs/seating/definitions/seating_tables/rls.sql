-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
alter table public.seating_tables enable row level security;
create policy seating_tables_member_select on public.seating_tables for select to authenticated using(private.is_project_member(project_id));
