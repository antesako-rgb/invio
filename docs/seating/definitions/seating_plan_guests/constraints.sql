-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
alter table public.seating_plan_guests add constraint seating_plan_guests_c1 primary key(plan_id,project_guest_id);
alter table public.seating_plan_guests add constraint seating_plan_guests_c2 unique(project_id,plan_id,project_guest_id);
alter table public.seating_plan_guests add constraint seating_plan_guests_c3 foreign key(project_id,plan_id) references public.seating_plans(project_id,id) on delete cascade;
alter table public.seating_plan_guests add constraint seating_plan_guests_c4 foreign key(project_id,project_guest_id) references public.project_guests(project_id,id) on delete no action deferrable initially deferred;
