-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
alter table public.seating_tables add constraint seating_tables_c1 primary key(id);
alter table public.seating_tables add constraint seating_tables_c2 check(char_length(trim(name)) between 1 and 150);
alter table public.seating_tables add constraint seating_tables_c3 check(shape in ('round','rectangle'));
alter table public.seating_tables add constraint seating_tables_c4 check(capacity between 1 and 100);
alter table public.seating_tables add constraint seating_tables_c5 check(x_cm between 0 and 100000);
alter table public.seating_tables add constraint seating_tables_c6 check(y_cm between 0 and 100000);
alter table public.seating_tables add constraint seating_tables_c7 check(width_cm between 10 and 10000);
alter table public.seating_tables add constraint seating_tables_c8 check(height_cm between 10 and 10000);
alter table public.seating_tables add constraint seating_tables_c9 check(rotation_deg between 0 and 359);
alter table public.seating_tables add constraint seating_tables_c10 unique(project_id,plan_id,id);
alter table public.seating_tables add constraint seating_tables_c11 foreign key(project_id,plan_id) references public.seating_plans(project_id,id) on delete cascade;
