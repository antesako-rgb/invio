-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create index seating_assignments_project_idx on public.seating_assignments(project_id);
create index seating_assignments_table_idx on public.seating_assignments(plan_id,table_id);
