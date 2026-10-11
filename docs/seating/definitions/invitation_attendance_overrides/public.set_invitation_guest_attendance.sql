-- Internal attendance decision; original RSVP answers are never edited.
create function public.set_invitation_guest_attendance(
 p_invitation_id uuid,p_project_guest_id uuid,p_status text
) returns jsonb language plpgsql security definer set search_path='' as $attendance$
declare v_project uuid;
begin
 if p_invitation_id is null or p_project_guest_id is null
  or (p_status is not null and p_status not in ('attending','not_attending')) then
  raise exception 'Invalid attendance arguments' using errcode='22023';
 end if;
 select project_id into v_project from public.invitations where id=p_invitation_id;
 perform private.lock_seating_project(v_project);
 perform 1 from public.invitation_guests where project_id=v_project
  and invitation_id=p_invitation_id and project_guest_id=p_project_guest_id;
 if not found then raise exception 'Invitation person missing' using errcode='22023'; end if;
 if p_status is null then
  delete from public.invitation_attendance_overrides
   where invitation_id=p_invitation_id and project_guest_id=p_project_guest_id;
 else
  perform 1 from public.project_guests where project_id=v_project and id=p_project_guest_id and archived_at is null;
  if not found then raise exception 'Active person missing' using errcode='22023'; end if;
  insert into public.invitation_attendance_overrides(project_id,invitation_id,project_guest_id,status,updated_by)
   values(v_project,p_invitation_id,p_project_guest_id,p_status,auth.uid())
   on conflict(invitation_id,project_guest_id) do update
    set status=excluded.status,updated_by=excluded.updated_by,updated_at=now();
 end if;
 return jsonb_build_object('project_guest_id',p_project_guest_id,'status',p_status);
end $attendance$;
revoke all on function public.set_invitation_guest_attendance(uuid,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.set_invitation_guest_attendance(uuid,uuid,text) to authenticated;
