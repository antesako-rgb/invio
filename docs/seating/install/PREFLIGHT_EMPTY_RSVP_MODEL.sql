-- READ ONLY. Empty seating model with installed 001-008; no guest data returned.
begin read only;
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
select true as empty_rsvp_model_ready;
rollback;
