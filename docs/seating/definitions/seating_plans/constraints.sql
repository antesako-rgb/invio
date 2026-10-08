-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
alter table public.seating_plans add constraint seating_plans_c1 primary key(id);
alter table public.seating_plans add constraint seating_plans_c2 foreign key(project_id) references public.projects(id) on delete cascade;
alter table public.seating_plans add constraint seating_plans_c3 check(char_length(trim(name)) between 1 and 150);
alter table public.seating_plans add constraint seating_plans_c4 check(width_cm between 100 and 100000);
alter table public.seating_plans add constraint seating_plans_c5 check(height_cm between 100 and 100000);
alter table public.seating_plans add constraint seating_plans_c6 check(revision>=1);
alter table public.seating_plans add constraint seating_plans_c7 unique(project_id,id);
alter table public.seating_plans add constraint seating_plans_c8 foreign key(project_id,rsvp_invitation_id) references public.invitations(project_id,id)
 on delete set null (rsvp_invitation_id);
