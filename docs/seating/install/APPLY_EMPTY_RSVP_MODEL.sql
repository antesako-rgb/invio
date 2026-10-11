-- REVIEWED EMPTY-MODEL SETUP, after installed 001-008. Not executed on live DB.
-- No guest backfill, data migration, reset, DROP, or automatic guest inclusion during setup.
-- Run PREFLIGHT_EMPTY_RSVP_MODEL.sql first. Stop seating writes; execute this WHOLE file once as postgres.
-- On error ROLLBACK and inspect. Only the final line commits.
begin;
set local search_path=pg_catalog,public;
lock table public.projects,public.project_guests,public.seating_plans,public.seating_plan_guests,public.seating_tables,public.seating_assignments in access exclusive mode;
do $preflight$
declare v record; p pg_proc;
begin
 if current_user<>'postgres' then raise exception 'Run reviewed model setup as postgres'; end if;
 if current_setting('server_version_num')::integer<150000 then raise exception 'PostgreSQL 15+ required'; end if;
 if to_regclass('private.seating_rsvp_exclusions') is not null
  or to_regprocedure('public.sync_seating_rsvp_guests(uuid,uuid,bigint)') is not null then
  raise exception 'RSVP model already configured: run verify instead of repeating setup';
 end if;
 if exists(select 1 from public.seating_plan_guests) or exists(select 1 from public.seating_assignments) then
  raise exception 'Setup expects empty seating participants and assignments; do not delete live data to bypass this guard';
 end if;
 for v in select * from (values
  ('public.manage_seating_participant(uuid,bigint,uuid,text)','640807ffac9b55f3e52416aa603d5bab'),
  ('public.assign_seating_guests(uuid,bigint,uuid[],uuid,text)','c94862c5435203fb7009f58f6ac83ee8'),
  ('public.assign_seating_guests_to_seats(uuid,bigint,uuid,jsonb)','31a6854903f834bb73f062cc70e2f217'),
  ('private.lock_seating_plan(uuid,bigint)','d9e93383f3f0a64e0a3e5a810eeca238'),
  ('private.lock_seating_project(uuid)','afc87aa28cec1c1f49fd3538e6500da1'),
  ('private.seating_authorize(uuid)','36cf256df5cbd404712998b6cfed8707')
 ) f(signature,source_md5) loop
  select * into p from pg_proc where oid=to_regprocedure(v.signature);
  if not found then raise exception 'Installed baseline missing: %',v.signature; end if;
  if p.proowner<>'postgres'::regrole or not p.prosecdef or p.proconfig is distinct from array['search_path=""']::text[]
   or p.prolang<>(select oid from pg_language where lanname='plpgsql')
   or md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g'))<>v.source_md5
   or has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('service_role',p.oid,'EXECUTE')
   or has_function_privilege('authenticated',p.oid,'EXECUTE')<>(left(v.signature,7)='public.') then
   raise exception 'Function/security baseline changed: %; review instead of removing guard',v.signature;
  end if;
 end loop;
 for v in select c.oid,c.relname,c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname in ('project_guests','seating_plans','seating_plan_guests','seating_tables','seating_assignments') loop
  if not v.relrowsecurity or (select count(*) from pg_policy where polrelid=v.oid)<>1
   or not exists(select 1 from pg_policy q where q.polrelid=v.oid and q.polcmd='r' and q.polpermissive
    and q.polroles=array['authenticated'::regrole::oid] and pg_get_expr(q.polqual,q.polrelid)='private.is_project_member(project_id)')
   or has_table_privilege('anon',v.oid,'SELECT,INSERT,UPDATE,DELETE')
   or not has_table_privilege('authenticated',v.oid,'SELECT')
   or has_table_privilege('authenticated',v.oid,'INSERT,UPDATE,DELETE') then raise exception 'Member RLS/ACL changed: %',v.relname; end if;
 end loop;
end $preflight$;

-- Transaction-local snapshot of plan metadata; no temporary relation is required.
select set_config('invio.seating_rsvp_plans_before',
 coalesce((select jsonb_agg(p order by p.id) from
  (select id,project_id,revision,rsvp_invitation_id from public.seating_plans) p),'[]'::jsonb)::text,true);
-- FINAL MODEL DEFINITION. Private state, not guest migration or a client table.
-- Apply the reviewed empty-model setup; do not run definitions separately on an installed model.
create table private.seating_rsvp_exclusions (
 project_id uuid not null,
 plan_id uuid not null,
 project_guest_id uuid not null,
 constraint seating_rsvp_exclusions_pk primary key(plan_id,project_guest_id),
 constraint seating_rsvp_exclusions_plan_fk foreign key(project_id,plan_id)
  references public.seating_plans(project_id,id) on delete cascade,
 constraint seating_rsvp_exclusions_person_fk foreign key(project_id,project_guest_id)
  references public.project_guests(project_id,id) on delete cascade
);
create index seating_rsvp_exclusions_project_idx on private.seating_rsvp_exclusions(project_id);
create index seating_rsvp_exclusions_person_idx on private.seating_rsvp_exclusions(project_guest_id);
alter table private.seating_rsvp_exclusions enable row level security;
revoke all on private.seating_rsvp_exclusions from public,anon,authenticated,service_role;

-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create or replace function public.manage_seating_participant(
 p_plan_id uuid,p_revision bigint,p_guest_id uuid,p_operation text
) returns bigint language plpgsql security definer set search_path='' as $participant$
declare v public.seating_plans; v_next bigint;
begin
 v:=private.lock_seating_plan(p_plan_id,p_revision);
 if p_operation='add' then
  perform 1 from public.project_guests where project_id=v.project_id and id=p_guest_id and archived_at is null;
  if not found then raise exception 'Active person missing' using errcode='22023'; end if;
  insert into public.seating_plan_guests(project_id,plan_id,project_guest_id) values(v.project_id,v.id,p_guest_id);
  delete from private.seating_rsvp_exclusions where plan_id=v.id and project_guest_id=p_guest_id;
 elsif p_operation='remove' then
  perform 1 from public.project_guests where project_id=v.project_id and id=p_guest_id;
  if not found then raise exception 'Person missing' using errcode='22023'; end if;
  -- Remember the explicit choice in this plan, including after changing its RSVP source.
  insert into private.seating_rsvp_exclusions(project_id,plan_id,project_guest_id)
   values(v.project_id,v.id,p_guest_id) on conflict(plan_id,project_guest_id) do nothing;
  delete from public.seating_plan_guests where plan_id=v.id and project_guest_id=p_guest_id;
 else raise exception 'Invalid operation' using errcode='22023'; end if;
 update public.seating_plans set revision=revision+1,updated_at=now() where id=v.id returning revision into v_next;
 return v_next;
end $participant$;

revoke all on function public.manage_seating_participant(uuid,bigint,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.manage_seating_participant(uuid,bigint,uuid,text) to authenticated;
-- FINAL MODEL DEFINITION. One authorized, atomic sync; no seat changes or public RSVP writes.
create function public.sync_seating_rsvp_guests(p_project_id uuid,p_plan_id uuid,p_revision bigint)
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
  where p.project_id=v.project_id and p.archived_at is null
   and not exists(select 1 from private.seating_rsvp_exclusions e where e.plan_id=v.id and e.project_guest_id=p.id)
   and not exists(select 1 from public.seating_plan_guests m where m.plan_id=v.id and m.project_guest_id=p.id)
   and coalesce(
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
   and not exists(select 1 from public.invitation_generic_guest_links l
    join public.rsvp_response_guests a on a.id=l.response_guest_id
    join public.rsvp_responses r on r.id=a.response_id
    where l.project_id=v.project_id and l.invitation_id=v.rsvp_invitation_id and l.project_guest_id=p.id
     and r.project_id=v.project_id and r.invitation_id=v.rsvp_invitation_id and r.response_type='generic' and a.status='not_attending')
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

do $preserve$
declare v_before jsonb; v_after jsonb;
begin
 v_before:=nullif(current_setting('invio.seating_rsvp_plans_before',true),'')::jsonb;
 select coalesce(jsonb_agg(p order by p.id),'[]'::jsonb) into v_after from
  (select id,project_id,revision,rsvp_invitation_id from public.seating_plans) p;
 if v_before is null then raise exception 'Setup snapshot missing: execute the whole file in one transaction'; end if;
 if v_after is distinct from v_before
  or exists(select 1 from public.seating_plan_guests) or exists(select 1 from public.seating_assignments)
  or exists(select 1 from private.seating_rsvp_exclusions) then raise exception 'Setup changed existing plan or guest data'; end if;
end $preserve$;
notify pgrst,'reload schema';
commit;
