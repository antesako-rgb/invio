-- READ ONLY. Structural PASS/FAIL, no RPC is invoked (it locks rows/writes).
-- Exact reviewed body hash proves the sole revision branch uses PT409, not 40001.
-- This does not prove existing backend loops have stopped; use IDENTIFY + logs.
begin read only;
set local search_path=pg_catalog,public;
do $verify$
declare p pg_proc;
begin
 select * into p from pg_proc where oid=to_regprocedure('private.lock_seating_plan(uuid,bigint)');
 if not found then raise exception 'FAIL: lock_seating_plan missing'; end if;
 if md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g')) <> '92e8c1d8e8e377943c9d8373d37e9990'
  or p.prosrc not like '%errcode=''PT409''%'
  or p.prosrc like '%40001%'
  or p.proowner <> 'postgres'::regrole or not p.prosecdef
  or p.proconfig is distinct from array['search_path=""']::text[]
  or p.prorettype <> 'public.seating_plans'::regtype
  or p.prolang <> (select oid from pg_language where lanname='plpgsql')
  or p.proacl is distinct from array['postgres=X/postgres']::aclitem[]
  or has_function_privilege('anon',p.oid,'EXECUTE')
  or has_function_privilege('authenticated',p.oid,'EXECUTE')
  or has_function_privilege('service_role',p.oid,'EXECUTE') then
  raise exception 'FAIL: revision hotfix source/security mismatch';
 end if;
end $verify$;
select true as revision_conflict_hotfix_verified,'PT409'::text as business_conflict_sqlstate;
-- Other explicit retry states remain separate audit findings, not hotfix failures.
select p.oid::regprocedure::text as remaining_retry_risk
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname in ('public','private') and p.prokind='f'
 and p.prosrc ~* '(40001|40P01|serialization_failure|deadlock_detected)';
rollback;
