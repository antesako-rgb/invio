-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function public.link_generic_rsvp_guest(p_response_guest_id uuid,p_project_guest_id uuid default null,p_create_new boolean default false) returns uuid language plpgsql security definer set search_path='' as $$
declare v_row public.rsvp_response_guests; v_project uuid; v_person uuid;
begin
 select project_id into v_project from public.rsvp_response_guests where id=p_response_guest_id;
 perform private.lock_seating_project(v_project);
 select g.* into v_row from public.rsvp_response_guests g join public.rsvp_responses r on r.id=g.response_id where g.id=p_response_guest_id and r.response_type='generic' and g.invitation_guest_id is null for update of g;
 if not found then raise exception 'Generic guest missing' using errcode='22023'; end if;
 if exists(select 1 from public.invitation_generic_guest_links where response_guest_id=p_response_guest_id) then raise exception 'Already linked: unlink explicitly first' using errcode='23505'; end if;
 if p_create_new then
 if p_project_guest_id is not null then raise exception 'Choose existing or new' using errcode='22023'; end if;
 insert into public.project_guests(project_id,first_name,last_name) values(v_row.project_id,v_row.first_name,v_row.last_name) returning id into v_person;
 else
 v_person:=p_project_guest_id;
 perform 1 from public.project_guests where project_id=v_row.project_id and id=v_person and archived_at is null; if not found then raise exception 'Active person missing' using errcode='22023'; end if;
 end if;
 if not exists(select 1 from public.invitation_guests where invitation_id=v_row.invitation_id and project_guest_id=v_person) then perform public.link_existing_invitation_guest(v_row.invitation_id,v_person,null); end if;
 insert into public.invitation_generic_guest_links(project_id,invitation_id,response_id,response_guest_id,project_guest_id) values(v_row.project_id,v_row.invitation_id,v_row.response_id,v_row.id,v_person);
 return v_person;
end $$;
