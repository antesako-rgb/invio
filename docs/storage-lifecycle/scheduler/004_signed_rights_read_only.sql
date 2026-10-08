-- READ ONLY metadata: never select decrypted_secret, headers or request signatures.
select c.relname,pg_get_userbyid(c.relowner) as owner,r.role,
 has_schema_privilege(r.role,n.oid,'USAGE') as schema_usage,
 has_table_privilege(r.role,c.oid,'SELECT') as table_select,
 has_any_column_privilege(r.role,c.oid,'SELECT') as can_read
from pg_class c join pg_namespace n on n.oid=c.relnamespace
cross join(values('anon'),('authenticated'),('service_role')) r(role)
where n.nspname='vault' and c.relname in ('secrets','decrypted_secrets');
select p.oid::regprocedure as signature,p.prosecdef,p.proconfig,p.proacl,
 has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
 has_function_privilege('authenticated',p.oid,'EXECUTE') as auth_execute,
 has_function_privilege('service_role',p.oid,'EXECUTE') as service_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where p.proname in ('enqueue_signed_storage_cleanup','storage_consume_cleanup_request');
-- Signer: postgres owner only; all three roles false. Consume RPC: service only.
select jobid,jobname,schedule,active,username from cron.job where jobname='memora-storage-cleanup';
-- Job must remain false. Exposed API schemas must exclude private/net/vault.

-- PUBLIC table and column ACLs, no secret values.
select c.relname,'table' as scope,null::text as column_name,x.privilege_type
from pg_class c join pg_namespace n on n.oid=c.relnamespace
cross join lateral aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) x
where n.nspname='vault' and c.relname in ('secrets','decrypted_secrets') and x.grantee=0
union all
select c.relname,'column',a.attname,x.privilege_type
from pg_class c join pg_namespace n on n.oid=c.relnamespace
join pg_attribute a on a.attrelid=c.oid cross join lateral aclexplode(a.attacl) x
where n.nspname='vault' and c.relname in ('secrets','decrypted_secrets') and x.grantee=0;
-- Candidate decrypt helpers/wrappers. Catalog names/ACL only; DO NOT invoke.
select p.oid::regprocedure as signature,n.nspname,p.prosecdef,p.proconfig,
 pg_get_userbyid(p.proowner) as owner,p.proacl,
 has_schema_privilege('anon',n.oid,'USAGE') as anon_usage,
 has_schema_privilege('authenticated',n.oid,'USAGE') as auth_usage,
 has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
 has_function_privilege('authenticated',p.oid,'EXECUTE') as auth_execute,
 has_function_privilege('service_role',p.oid,'EXECUTE') as service_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where p.prokind='f' and (n.nspname='vault' or p.prosrc ilike '%decrypted_secrets%'
 or p.prosrc ilike '%vault.%' or p.proname ilike '%decrypt%');
-- Settings visible to SQL may not show Management API configuration.
select current_setting('pgrst.db_schemas',true) as session_exposed_schemas;
select coalesce(r.rolname,'ALL') as role,d.datname,setting
from pg_db_role_setting s left join pg_roles r on r.oid=s.setrole
left join pg_database d on d.oid=s.setdatabase
cross join lateral unnest(s.setconfig) setting where setting like 'pgrst.db_schemas=%';
-- NULL/no rows is NOT proof of non-exposure: also check Dashboard Data API exposed schemas.
-- service_role SELECT is administrative access, separately audited; guard permits it.
