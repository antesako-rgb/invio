-- MANUAL REVIEW/EXECUTION ONLY. NOT executed by Codex.
-- Existing DEV model, no reset/backfill. Only one SQLSTATE literal is changed.
-- Close seating editors/stop seating requests; deploy compatible error handling first.
-- Run the WHOLE file as postgres. On error issue ROLLBACK separately.
begin;
set local search_path=pg_catalog,public;
set local lock_timeout='5s';
set local statement_timeout='15s';
do $hotfix$
declare
 p pg_proc; updated pg_proc;
 expected_source text; definition text;
begin
 if current_user <> 'postgres' then raise exception 'Run as postgres'; end if;
 select * into p from pg_proc where oid=to_regprocedure('private.lock_seating_plan(uuid,bigint)');
 if not found then raise exception 'lock_seating_plan missing'; end if;
 if md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g')) <> 'd9e93383f3f0a64e0a3e5a810eeca238'
  or p.proowner <> 'postgres'::regrole or not p.prosecdef
  or p.proconfig is distinct from array['search_path=""']::text[]
  or p.prorettype <> 'public.seating_plans'::regtype
  or p.prolang <> (select oid from pg_language where lanname='plpgsql')
  or p.proacl is distinct from array['postgres=X/postgres']::aclitem[]
  or has_function_privilege('anon',p.oid,'EXECUTE')
  or has_function_privilege('authenticated',p.oid,'EXECUTE')
  or has_function_privilege('service_role',p.oid,'EXECUTE')
  or exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where a.grantee=0 and a.privilege_type='EXECUTE') then
  raise exception 'Baseline/security mismatch or already patched: inspect; do not remove this guard';
 end if;
 expected_source:=replace(p.prosrc,'errcode=''40001''','errcode=''PT409''');
 if expected_source=p.prosrc then raise exception 'Exact revision error literal missing'; end if;
 definition:=replace(pg_get_functiondef(p.oid),'errcode=''40001''','errcode=''PT409''');
 execute definition;
 select * into updated from pg_proc where oid=p.oid;
 if updated.prosrc is distinct from expected_source
  or (to_jsonb(updated)-'prosrc') is distinct from (to_jsonb(p)-'prosrc') then
  raise exception 'Unexpected source/metadata/ACL change; transaction rolled back';
 end if;
end $hotfix$;
-- No RPC signature or grants changed; no schema reload is required.
commit;
