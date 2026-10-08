-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function public.link_existing_invitation_guest(p_invitation_id uuid,p_project_guest_id uuid,p_group_id uuid default null) returns public.invitation_guests language plpgsql security definer set search_path='' as $$
declare v_project uuid; v_guest public.invitation_guests;
begin select project_id into v_project from public.invitations where id=p_invitation_id; perform private.lock_seating_project(v_project);
 perform 1 from public.project_guests where project_id=v_project and id=p_project_guest_id and archived_at is null; if not found then raise exception 'Active person missing' using errcode='22023'; end if;
 insert into public.invitation_guests(project_id,invitation_id,project_guest_id,first_name,last_name,group_id) select v_project,p_invitation_id,id,first_name,last_name,p_group_id from public.project_guests where id=p_project_guest_id returning * into v_guest; return v_guest;
end $$;
