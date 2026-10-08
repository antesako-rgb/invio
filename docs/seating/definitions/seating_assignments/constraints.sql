-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
alter table public.seating_assignments add constraint seating_assignments_c1 primary key(plan_id,project_guest_id);
alter table public.seating_assignments add constraint seating_assignments_c2 foreign key(project_id,plan_id,project_guest_id)
 references public.seating_plan_guests(project_id,plan_id,project_guest_id) on delete cascade;
alter table public.seating_assignments add constraint seating_assignments_c3 foreign key(project_id,plan_id,table_id)
 references public.seating_tables(project_id,plan_id,id) on delete cascade;
