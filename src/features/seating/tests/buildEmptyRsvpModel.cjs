/* eslint-disable @typescript-eslint/no-require-imports */
// Generate reviewed setup/verify from canonical definitions, without touching any database.
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=path.resolve(__dirname,"../../../..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
function hash(sql){const match=sql.match(/as \$([a-z_]*)\$([\s\S]*?)\$\1\$/i);if(!match)throw Error("Function body missing");return crypto.createHash("md5").update(match[2].replace(/\s+/g," ")).digest("hex");}
function files(){
 const participant=read("docs/seating/definitions/seating_plan_guests/public.manage_seating_participant.sql");
 // Freeze the installed first RSVP package; newer definitions have a separate setup.
 const sync=read("src/features/seating/tests/fixtures/installedRsvpSync.sql");
 const exclusions=read("docs/seating/definitions/seating_rsvp_exclusions/table.sql");
 const preflight=`-- READ ONLY. Empty seating model with installed 001-008; no guest data returned.
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
`;
 const verifyBlock=`do $verify$
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
  ('public.manage_seating_participant(uuid,bigint,uuid,text)','${hash(participant)}','bigint'),
  ('public.sync_seating_rsvp_guests(uuid,uuid,bigint)','${hash(sync)}','jsonb')
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
`;
 const setup=`-- REVIEWED EMPTY-MODEL SETUP, after installed 001-008. Not executed on live DB.
-- No guest backfill, data migration, reset, DROP, or automatic guest inclusion during setup.
-- Run PREFLIGHT_EMPTY_RSVP_MODEL.sql first. Stop seating writes; execute this WHOLE file once as postgres.
-- On error ROLLBACK and inspect. Only the final line commits.
begin;
set local search_path=pg_catalog,public;
lock table public.projects,public.project_guests,public.seating_plans,public.seating_plan_guests,public.seating_tables,public.seating_assignments in access exclusive mode;
${preflight.slice(preflight.indexOf("do $preflight$"),preflight.indexOf("select true as"))}
-- Transaction-local snapshot of plan metadata; no temporary relation is required.
select set_config('invio.seating_rsvp_plans_before',
 coalesce((select jsonb_agg(p order by p.id) from
  (select id,project_id,revision,rsvp_invitation_id from public.seating_plans) p),'[]'::jsonb)::text,true);
${exclusions}
${participant}
revoke all on function public.manage_seating_participant(uuid,bigint,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.manage_seating_participant(uuid,bigint,uuid,text) to authenticated;
${sync}
${verifyBlock}
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
`;
 return {
  "PREFLIGHT_EMPTY_RSVP_MODEL.sql":preflight,
  "APPLY_EMPTY_RSVP_MODEL.sql":setup,
  "VERIFY_RSVP_MODEL_READ_ONLY.sql":`-- READ ONLY after setup; no personal data returned.\nbegin read only;\nset local search_path=pg_catalog,public;\n${verifyBlock}select true as rsvp_model_verified,has_function_privilege('authenticated','public.sync_seating_rsvp_guests(uuid,uuid,bigint)','EXECUTE') as member_execute;\nrollback;\n`,
 };
}
module.exports={files};
if(require.main===module){
 if(process.argv[2]!=="--write")throw Error("Use --write to prepare reviewed SQL files; this script never runs SQL");
 for(const [name,sql]of Object.entries(files()))fs.writeFileSync(path.join(root,"docs/seating/install",name),sql,"utf8");
 console.log("Prepared 3 empty-model SQL files from canonical definitions. No DB access.");
}
