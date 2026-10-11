-- REVIEWED EMPTY-MODEL SETUP. Not run on live DB by the agent.
-- Existing 001-008 and RSVP model required. No deletion, guest migration/backfill or import.
-- Stop seating/guest/RSVP writes. Run preflight; execute this WHOLE file once as postgres.
-- On error ROLLBACK and inspect. Only the final line commits.
begin;
set local search_path=pg_catalog,public;
lock table public.projects,public.invitations,public.project_guests,public.invitation_guests,
 public.rsvp_responses,public.rsvp_response_guests,public.invitation_generic_guest_links,
 public.seating_plans,public.seating_plan_guests,public.seating_tables,public.seating_assignments,
 private.seating_rsvp_exclusions in access exclusive mode;
do $preflight$
declare v record; p pg_proc;
begin
 if current_user<>'postgres' then raise exception 'Run empty attendance setup as postgres'; end if;
 if current_setting('server_version_num')::integer<150000 then raise exception 'PostgreSQL 15+ required'; end if;
 if to_regclass('public.invitation_attendance_overrides') is not null
  or to_regprocedure('public.set_invitation_guest_attendance(uuid,uuid,text)') is not null
  or to_regprocedure('public.include_generic_seating_guest(uuid,bigint,uuid,uuid,boolean)') is not null then
  raise exception 'Attendance model already configured: run attendance verify';
 end if;
 if exists(select 1 from public.project_guests) or exists(select 1 from public.seating_plan_guests)
  or exists(select 1 from public.seating_assignments) or exists(select 1 from private.seating_rsvp_exclusions) then
  raise exception 'Setup requires empty project guests and seating data; do not delete live data to bypass this guard';
 end if;
 for v in select * from (values
  ('public.link_generic_rsvp_guest(uuid,uuid,boolean)','40a9692d13f46d1f5058c85d53f5019f',true),
  ('private.lock_seating_project(uuid)','afc87aa28cec1c1f49fd3538e6500da1',false),
  ('private.lock_seating_plan(uuid,bigint)','d9e93383f3f0a64e0a3e5a810eeca238',false)
 ) f(signature,source_md5,client_api) loop
  select * into p from pg_proc where oid=to_regprocedure(v.signature);
  if not found then raise exception 'Required baseline missing: %',v.signature; end if;
  if p.proowner<>'postgres'::regrole or not p.prosecdef or p.proconfig is distinct from array['search_path=""']::text[]
   or p.prolang<>(select oid from pg_language where lanname='plpgsql')
   or md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g'))<>v.source_md5
   or has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('service_role',p.oid,'EXECUTE')
   or has_function_privilege('authenticated',p.oid,'EXECUTE')<>v.client_api then raise exception 'Attendance baseline changed: %',v.signature; end if;
 end loop;
end $preflight$;
do $verify$
declare v record; p pg_proc;
begin
 if not exists(select 1 from pg_class where oid=to_regclass('private.seating_rsvp_exclusions')
  and relowner='postgres'::regrole and relrowsecurity)
  or exists(select 1 from pg_policy where polrelid='private.seating_rsvp_exclusions'::regclass)
  or has_table_privilege('anon','private.seating_rsvp_exclusions','SELECT,INSERT,UPDATE,DELETE')
  or has_table_privilege('authenticated','private.seating_rsvp_exclusions','SELECT,INSERT,UPDATE,DELETE')
  or has_table_privilege('service_role','private.seating_rsvp_exclusions','SELECT,INSERT,UPDATE,DELETE') then
  raise exception 'Private exclusion table security mismatch';
 end if;
 if (select count(*) from pg_constraint where conrelid='private.seating_rsvp_exclusions'::regclass and convalidated and (
  (conname='seating_rsvp_exclusions_pk' and contype='p' and pg_get_constraintdef(oid)='PRIMARY KEY (plan_id, project_guest_id)')
  or (conname='seating_rsvp_exclusions_plan_fk' and contype='f' and pg_get_constraintdef(oid)='FOREIGN KEY (project_id, plan_id) REFERENCES seating_plans(project_id, id) ON DELETE CASCADE')
  or (conname='seating_rsvp_exclusions_person_fk' and contype='f' and pg_get_constraintdef(oid)='FOREIGN KEY (project_id, project_guest_id) REFERENCES project_guests(project_id, id) ON DELETE CASCADE')
 ))<>3 then raise exception 'Private exclusion constraints mismatch'; end if;
 for v in select * from (values
  ('public.manage_seating_participant(uuid,bigint,uuid,text)','ae2cb613034af220ca9a78a1dca3d367','bigint'),
  ('public.sync_seating_rsvp_guests(uuid,uuid,bigint)','94a12292ea88fef8510bce00866ed9ae','jsonb')
 ) f(signature,source_md5,result_type) loop
  select * into p from pg_proc where oid=to_regprocedure(v.signature);
  if not found then raise exception 'RSVP function missing: %',v.signature; end if;
  if p.proowner<>'postgres'::regrole or not p.prosecdef or p.proconfig is distinct from array['search_path=""']::text[]
   or p.prolang<>(select oid from pg_language where lanname='plpgsql') or p.prorettype<>v.result_type::regtype
   or md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g'))<>v.source_md5
   or has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('service_role',p.oid,'EXECUTE')
   or not has_function_privilege('authenticated',p.oid,'EXECUTE') then raise exception 'RSVP function/security mismatch: %',v.signature; end if;
 end loop;
end $verify$;

do $snapshot$ begin
 perform set_config('invio.attendance_plans_before',coalesce((select jsonb_agg(p order by p.id) from
  (select id,project_id,revision,rsvp_invitation_id from public.seating_plans) p),'[]'::jsonb)::text,true);
end $snapshot$;
-- Final definition. Use the reviewed empty attendance setup on an installed model.
create table public.invitation_attendance_overrides (
 project_id uuid not null,
 invitation_id uuid not null,
 project_guest_id uuid not null,
 status text not null check(status in ('attending','not_attending')),
 updated_by uuid not null,
 updated_at timestamptz not null default now(),
 constraint invitation_attendance_overrides_pk primary key(invitation_id,project_guest_id),
 constraint invitation_attendance_overrides_guest_fk foreign key(project_id,invitation_id,project_guest_id)
  references public.invitation_guests(project_id,invitation_id,project_guest_id) on delete cascade
);
create index invitation_attendance_overrides_project_idx on public.invitation_attendance_overrides(project_id);
alter table public.invitation_attendance_overrides enable row level security;
create policy invitation_attendance_overrides_member_select on public.invitation_attendance_overrides
 for select to authenticated using(private.is_project_member(project_id));
revoke all on public.invitation_attendance_overrides from public,anon,authenticated,service_role;
grant select on public.invitation_attendance_overrides to authenticated;

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

do $verify_attendance$
declare v record; p pg_proc;
begin
 if not exists(select 1 from pg_class where oid=to_regclass('public.invitation_attendance_overrides') and relowner='postgres'::regrole and relrowsecurity)
  or has_table_privilege('anon','public.invitation_attendance_overrides','SELECT,INSERT,UPDATE,DELETE')
  or has_table_privilege('service_role','public.invitation_attendance_overrides','SELECT,INSERT,UPDATE,DELETE')
  or has_table_privilege('authenticated','public.invitation_attendance_overrides','INSERT,UPDATE,DELETE')
  or not has_table_privilege('authenticated','public.invitation_attendance_overrides','SELECT') then raise exception 'Attendance table ACL/RLS mismatch'; end if;
 if (select count(*) from pg_policy where polrelid='public.invitation_attendance_overrides'::regclass)<>1
  or not exists(select 1 from pg_policy where polrelid='public.invitation_attendance_overrides'::regclass
   and polcmd='r' and polpermissive and polroles=array['authenticated'::regrole::oid]
   and pg_get_expr(polqual,polrelid)='private.is_project_member(project_id)') then raise exception 'Attendance policy mismatch'; end if;
 if not exists(select 1 from pg_constraint where conrelid='public.invitation_attendance_overrides'::regclass
  and conname='invitation_attendance_overrides_pk' and contype='p' and convalidated
  and pg_get_constraintdef(oid)='PRIMARY KEY (invitation_id, project_guest_id)')
  or not exists(select 1 from pg_constraint where conrelid='public.invitation_attendance_overrides'::regclass
   and conname='invitation_attendance_overrides_guest_fk' and contype='f' and convalidated
   and pg_get_constraintdef(oid)='FOREIGN KEY (project_id, invitation_id, project_guest_id) REFERENCES invitation_guests(project_id, invitation_id, project_guest_id) ON DELETE CASCADE')
  or not exists(select 1 from pg_constraint where conrelid='public.invitation_attendance_overrides'::regclass
   and contype='c' and convalidated and pg_get_constraintdef(oid)='CHECK ((status = ANY (ARRAY[''attending''::text, ''not_attending''::text])))') then raise exception 'Attendance constraints mismatch'; end if;
 for v in select * from (values
  ('public.set_invitation_guest_attendance(uuid,uuid,text)','0fd98e43a878269ea5516aa41a63d432'),
  ('public.include_generic_seating_guest(uuid,bigint,uuid,uuid,boolean)','8dcd1be7d7057a9673ed37258f91edf0'),
  ('public.sync_seating_rsvp_guests(uuid,uuid,bigint)','1b16d2e5c77298818ce30af56b05577e')
 ) f(signature,source_md5) loop
  select * into p from pg_proc where oid=to_regprocedure(v.signature);
  if not found then raise exception 'Attendance RPC missing: %',v.signature; end if;
  if p.proowner<>'postgres'::regrole or not p.prosecdef or p.proconfig is distinct from array['search_path=""']::text[]
   or p.prorettype<>'jsonb'::regtype or p.prolang<>(select oid from pg_language where lanname='plpgsql')
   or md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g'))<>v.source_md5
   or has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('service_role',p.oid,'EXECUTE')
   or not has_function_privilege('authenticated',p.oid,'EXECUTE') then raise exception 'Attendance RPC/security mismatch: %',v.signature; end if;
 end loop;
end $verify_attendance$;

do $preserve$ declare v_after jsonb; v_before jsonb; begin
 v_before:=nullif(current_setting('invio.attendance_plans_before',true),'')::jsonb;
 select coalesce(jsonb_agg(p order by p.id),'[]'::jsonb) into v_after from
  (select id,project_id,revision,rsvp_invitation_id from public.seating_plans) p;
 if v_before is null or v_after is distinct from v_before
  or exists(select 1 from public.project_guests) or exists(select 1 from public.seating_plan_guests)
  or exists(select 1 from public.seating_assignments) or exists(select 1 from public.invitation_attendance_overrides) then
  raise exception 'Attendance setup changed existing plan/guest data'; end if;
end $preserve$;
notify pgrst,'reload schema';
commit;
