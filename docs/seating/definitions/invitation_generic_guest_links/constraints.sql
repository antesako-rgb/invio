-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
alter table public.invitation_generic_guest_links add constraint invitation_generic_guest_links_c1 primary key(response_guest_id);
alter table public.invitation_generic_guest_links add constraint invitation_generic_guest_links_c2 foreign key(project_id,invitation_id,response_id,response_guest_id)
 references public.rsvp_response_guests(project_id,invitation_id,response_id,id) on delete cascade;
alter table public.invitation_generic_guest_links add constraint invitation_generic_guest_links_c3 foreign key(project_id,project_guest_id) references public.project_guests(project_id,id) on delete no action deferrable initially deferred;
alter table public.invitation_generic_guest_links add constraint invitation_generic_guest_links_c4 unique(response_id,project_guest_id);
alter table public.invitation_generic_guest_links add constraint generic_link_invitation_person_fk foreign key(project_id,invitation_id,project_guest_id) references public.invitation_guests(project_id,invitation_id,project_guest_id) on delete cascade;
