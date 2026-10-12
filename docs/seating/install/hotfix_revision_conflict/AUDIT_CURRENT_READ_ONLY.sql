-- READ ONLY. Metadata only; no function calls, query parameters or personal data.
begin read only;
select p.oid::regprocedure::text as signature,pg_get_userbyid(p.proowner) as owner,
 p.prosecdef,p.proconfig,
 md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g')) as source_md5,
 array(select distinct m[1] from regexp_matches(p.prosrc,
  '(?:errcode\s*=\s*|sqlstate\s*)''([A-Z0-9]{5})''','gi') m) as explicit_sqlstates
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname in ('public','private') and p.prokind='f'
 and p.prosrc ~* '(40001|40P01|55P03|57014|serialization_failure|deadlock_detected|lock_not_available|query_canceled)'
order by signature;
-- PL/pgSQL string bodies are not always fully tracked by pg_depend. Search the
-- reviewed sources as well; this is a caller inventory, not a complete SQL parser.
select p.oid::regprocedure::text as signature,
 has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
 has_function_privilege('authenticated',p.oid,'EXECUTE') as member_execute,
 has_function_privilege('service_role',p.oid,'EXECUTE') as service_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname in ('public','private') and p.prokind='f'
 and (p.prosrc ilike '%lock_seating_plan%' or p.prosrc ilike '%assign_seating_guest_internal%')
order by signature;
rollback;
