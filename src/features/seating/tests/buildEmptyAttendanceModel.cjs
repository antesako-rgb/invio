/* eslint-disable @typescript-eslint/no-require-imports */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=path.resolve(__dirname,"../../../.."),read=file=>fs.readFileSync(path.join(root,file),"utf8");
const hash=sql=>{const m=sql.match(/as \$([a-z_]*)\$([\s\S]*?)\$\1\$/i);return crypto.createHash("md5").update(m[2].replace(/\s+/g," ")).digest("hex");};
function files(){
 const table=read("docs/seating/definitions/invitation_attendance_overrides/table.sql");
 const set=read("docs/seating/definitions/invitation_attendance_overrides/public.set_invitation_guest_attendance.sql");
 const include=read("docs/seating/definitions/seating_plan_guests/public.include_generic_seating_guest.sql");
 const sync=read("docs/seating/definitions/seating_plan_guests/public.sync_seating_rsvp_guests.sql");
 const baseline=read("docs/seating/install/VERIFY_RSVP_MODEL_READ_ONLY.sql").match(/do \$verify\$[\s\S]*?end \$verify\$;/)[0];
 const preflight=`do $preflight$
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
  ('public.link_generic_rsvp_guest(uuid,uuid,boolean)','${hash(read("docs/seating/definitions/invitation_generic_guest_links/public.link_generic_rsvp_guest.sql"))}',true),
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
${baseline}
`;
 const verify=`do $verify_attendance$
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
  ('public.set_invitation_guest_attendance(uuid,uuid,text)','${hash(set)}'),
  ('public.include_generic_seating_guest(uuid,bigint,uuid,uuid,boolean)','${hash(include)}'),
  ('public.sync_seating_rsvp_guests(uuid,uuid,bigint)','${hash(sync)}')
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
`;
 return {
  "PREFLIGHT_EMPTY_ATTENDANCE_MODEL.sql":`-- READ ONLY, after installed RSVP model. No personal data returned.\nbegin read only;\nset local search_path=pg_catalog,public;\n${preflight}select true as empty_attendance_model_ready;\nrollback;\n`,
  "APPLY_EMPTY_ATTENDANCE_MODEL.sql":`-- REVIEWED EMPTY-MODEL SETUP. Not run on live DB by the agent.
-- Existing 001-008 and RSVP model required. No deletion, guest migration/backfill or import.
-- Stop seating/guest/RSVP writes. Run preflight; execute this WHOLE file once as postgres.
-- On error ROLLBACK and inspect. Only the final line commits.
begin;
set local search_path=pg_catalog,public;
lock table public.projects,public.invitations,public.project_guests,public.invitation_guests,
 public.rsvp_responses,public.rsvp_response_guests,public.invitation_generic_guest_links,
 public.seating_plans,public.seating_plan_guests,public.seating_tables,public.seating_assignments,
 private.seating_rsvp_exclusions in access exclusive mode;
${preflight}
do $snapshot$ begin
 perform set_config('invio.attendance_plans_before',coalesce((select jsonb_agg(p order by p.id) from
  (select id,project_id,revision,rsvp_invitation_id from public.seating_plans) p),'[]'::jsonb)::text,true);
end $snapshot$;
${table}\n${set}\n${include}\n${sync}\n${verify}
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
`,
  "VERIFY_ATTENDANCE_MODEL_READ_ONLY.sql":`-- READ ONLY after attendance setup. No personal data returned.\nbegin read only;\nset local search_path=pg_catalog,public;\n${verify}select true as attendance_model_verified,true as member_execute;\nrollback;\n`,
 };
}
module.exports={files};
if(require.main===module){if(process.argv[2]!=="--write")throw Error("Use --write; this script never accesses a DB");for(const[name,sql]of Object.entries(files()))fs.writeFileSync(path.join(root,"docs/seating/install",name),sql,"utf8");console.log("Prepared 3 empty attendance setup files. No DB access.");}
