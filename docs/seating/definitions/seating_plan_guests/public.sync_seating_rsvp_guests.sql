-- FINAL MODEL DEFINITION. One authorized, atomic sync; no seat changes or public RSVP writes.
create or replace function public.sync_seating_rsvp_guests(p_project_id uuid,p_plan_id uuid,p_revision bigint)
returns jsonb language plpgsql security definer set search_path='' as $rsvp_sync$
declare v public.seating_plans; v_added integer:=0; v_next bigint;
begin
 if p_project_id is null or p_revision is null or p_revision<1 or p_revision>=9007199254740991 then
  raise exception 'Invalid sync arguments' using errcode='22023';
 end if;
 v:=private.lock_seating_plan(p_plan_id,p_revision);
 if v.project_id<>p_project_id then raise exception 'Project mismatch' using errcode='22023'; end if;
 v_next:=v.revision;
 if v.rsvp_invitation_id is not null then
  insert into public.seating_plan_guests(project_id,plan_id,project_guest_id)
  select v.project_id,v.id,p.id from public.project_guests p
  join public.invitation_guests i on i.project_id=v.project_id and i.invitation_id=v.rsvp_invitation_id and i.project_guest_id=p.id
  left join public.invitation_attendance_overrides o on o.project_id=v.project_id
   and o.invitation_id=v.rsvp_invitation_id and o.project_guest_id=p.id
  where p.project_id=v.project_id and p.archived_at is null
   and not exists(select 1 from private.seating_rsvp_exclusions e where e.plan_id=v.id and e.project_guest_id=p.id)
   and not exists(select 1 from public.seating_plan_guests m where m.plan_id=v.id and m.project_guest_id=p.id)
   and coalesce(
    o.status,
    (select a.status from public.rsvp_response_guests a join public.rsvp_responses r on r.id=a.response_id
     where r.project_id=v.project_id and r.invitation_id=v.rsvp_invitation_id and r.response_type='personalized'
      and a.invitation_guest_id=i.id order by r.submitted_at desc,r.id desc limit 1),
    (select 'attending' where exists(select 1 from public.invitation_generic_guest_links l
     join public.rsvp_response_guests a on a.id=l.response_guest_id
     join public.rsvp_responses r on r.id=a.response_id
     where l.project_id=v.project_id and l.invitation_id=v.rsvp_invitation_id and l.project_guest_id=p.id
      and r.project_id=v.project_id and r.invitation_id=v.rsvp_invitation_id and r.response_type='generic' and a.status='attending'))
   )='attending'
   -- A contradicting generic answer is a conflict even when the personalized answer wins.
   and (o.status is not null or not exists(select 1 from public.invitation_generic_guest_links l
    join public.rsvp_response_guests a on a.id=l.response_guest_id
    join public.rsvp_responses r on r.id=a.response_id
    where l.project_id=v.project_id and l.invitation_id=v.rsvp_invitation_id and l.project_guest_id=p.id
     and r.project_id=v.project_id and r.invitation_id=v.rsvp_invitation_id and r.response_type='generic' and a.status='not_attending'))
  order by p.id on conflict(plan_id,project_guest_id) do nothing;
  get diagnostics v_added=row_count;
  if v_added>0 then
   update public.seating_plans set revision=revision+1,updated_at=now() where id=v.id returning revision into v_next;
  end if;
 end if;
 return jsonb_build_object('revision',v_next,'added_count',v_added);
end $rsvp_sync$;
revoke all on function public.sync_seating_rsvp_guests(uuid,uuid,bigint) from public,anon,authenticated,service_role;
grant execute on function public.sync_seating_rsvp_guests(uuid,uuid,bigint) to authenticated;
