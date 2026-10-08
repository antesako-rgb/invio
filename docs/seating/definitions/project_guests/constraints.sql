-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
alter table public.project_guests add constraint project_guests_c1 primary key(id);
alter table public.project_guests add constraint project_guests_c2 foreign key(project_id) references public.projects(id) on delete cascade;
alter table public.project_guests add constraint project_guests_c3 check(char_length(trim(first_name)) between 1 and 100);
alter table public.project_guests add constraint project_guests_c4 check(last_name is null or char_length(trim(last_name)) between 1 and 100);
alter table public.project_guests add constraint project_guests_c5 check(notes is null or char_length(notes)<=2000);
alter table public.project_guests add constraint project_guests_c6 unique(project_id,id);
