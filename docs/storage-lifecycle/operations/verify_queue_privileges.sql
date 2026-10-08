-- READ ONLY. Metadata only; NEVER reads queued headers or secret values.
select n.nspname,c.relname,pg_get_userbyid(c.relowner) as owner,c.relrowsecurity,
 coalesce((select bool_or(a.privilege_type='SELECT') from aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a where a.grantee=0),false) as public_select
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='net' and c.relname in ('http_request_queue','_http_response');
select r.role_name,c.relname,
 has_schema_privilege(r.role_name,n.oid,'USAGE') as schema_usage,
 has_table_privilege(r.role_name,c.oid,'SELECT') as table_select,
 has_any_column_privilege(r.role_name,c.oid,'SELECT') as any_column_select
from pg_class c join pg_namespace n on n.oid=c.relnamespace
cross join (values ('anon'),('authenticated')) r(role_name)
where n.nspname='net' and c.relname in ('http_request_queue','_http_response');
select r.role_name,a.attname,has_column_privilege(r.role_name,c.oid,a.attnum,'SELECT') as can_read_column
from pg_class c join pg_namespace n on n.oid=c.relnamespace
join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped
cross join (values ('anon'),('authenticated')) r(role_name)
where n.nspname='net' and c.relname='http_request_queue' and a.attname='headers';
select rolname,rolcanlogin from pg_roles where rolcanlogin order by rolname;
-- Confirm API Settings > Exposed schemas DOES NOT include net or vault.
-- DB setting can be absent/overridden by hosted PostgREST configuration:
select current_setting('pgrst.db_schemas',true) as db_exposed_schemas_hint;
