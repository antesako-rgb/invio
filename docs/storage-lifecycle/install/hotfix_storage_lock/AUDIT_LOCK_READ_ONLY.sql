-- READ ONLY. Catalog/lock metadata only; no application RPC or lock acquisition.
-- This snapshot is not a concurrent-behavior test and does not stop processes.
begin read only;
select now() as inspected_at, l.pid, a.backend_start, a.xact_start,
  a.usename, a.application_name, a.state, l.mode, l.granted,
  a.wait_event_type, a.wait_event
from pg_locks l
left join pg_stat_activity a on a.pid = l.pid
where l.locktype = 'advisory'
  and l.database = (select oid from pg_database where datname = current_database())
  and l.classid = 79314 and l.objid = 1 and l.objsubid = 2
order by l.pid;

select p.oid::regprocedure::text as signature,
  pg_get_userbyid(p.proowner) as owner, p.prosecdef, p.proconfig,
  md5(regexp_replace(p.prosrc, '[[:space:]]+', ' ', 'g')) as source_md5,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as member_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') as service_execute
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'private')
  and (p.oid = to_regprocedure('private.storage_lock()')
       or p.prosrc ilike '%private.storage_lock()%')
order by signature;
rollback;
