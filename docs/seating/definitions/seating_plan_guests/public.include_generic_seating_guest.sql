-- Explicit identity decision plus plan inclusion in one authorized transaction.
create function public.include_generic_seating_guest(
 p_plan_id uuid,p_revision bigint,p_response_guest_id uuid,p_project_guest_id uuid,p_create_new boolean
) returns jsonb language plpgsql security definer set search_path='' as $generic_seating$
declare v public.seating_plans; v_person uuid; v_next bigint;
begin
 if p_revision is null or p_revision<1 or p_revision>=9007199254740991 then
  raise exception 'Invalid generic inclusion revision' using errcode='22023';
 end if;
 v:=private.lock_seating_plan(p_plan_id,p_revision);
 if p_response_guest_id is null or p_create_new is null
  or (p_create_new and p_project_guest_id is not null)
  or (not p_create_new and p_project_guest_id is null) then
  raise exception 'Invalid generic inclusion arguments' using errcode='22023';
 end if;
 perform 1 from public.rsvp_response_guests g join public.rsvp_responses r on r.id=g.response_id
  where g.id=p_response_guest_id and g.project_id=v.project_id
   and g.invitation_id=v.rsvp_invitation_id and r.project_id=v.project_id
   and r.invitation_id=v.rsvp_invitation_id and r.response_type='generic' and g.invitation_guest_id is null;
 if not found then raise exception 'Generic guest outside plan source' using errcode='22023'; end if;
 select project_guest_id into v_person from public.invitation_generic_guest_links where response_guest_id=p_response_guest_id;
 if found then
  if not p_create_new and v_person<>p_project_guest_id then
   raise exception 'Generic guest already linked to another person' using errcode='23505';
  end if;
 else
  v_person:=public.link_generic_rsvp_guest(p_response_guest_id,p_project_guest_id,p_create_new);
 end if;
 perform 1 from public.project_guests where project_id=v.project_id and id=v_person and archived_at is null;
 if not found then raise exception 'Active person missing' using errcode='22023'; end if;
 insert into public.seating_plan_guests(project_id,plan_id,project_guest_id)
  values(v.project_id,v.id,v_person) on conflict(plan_id,project_guest_id) do nothing;
 delete from private.seating_rsvp_exclusions where plan_id=v.id and project_guest_id=v_person;
 update public.seating_plans set revision=revision+1,updated_at=now() where id=v.id returning revision into v_next;
 return jsonb_build_object('revision',v_next,'project_guest_id',v_person);
end $generic_seating$;
revoke all on function public.include_generic_seating_guest(uuid,bigint,uuid,uuid,boolean) from public,anon,authenticated,service_role;
grant execute on function public.include_generic_seating_guest(uuid,bigint,uuid,uuid,boolean) to authenticated;
