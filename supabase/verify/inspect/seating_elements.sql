-- READ ONLY. Metadata only, no guest rows or mutating RPC calls.
begin read only;
set local search_path=pg_catalog,public;
select jsonb_build_object(
 'table', (select jsonb_build_object('owner',pg_get_userbyid(c.relowner),'rls',c.relrowsecurity,'force_rls',c.relforcerowsecurity,
 'columns',(select jsonb_agg(jsonb_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),'not_null',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid),'acl',a.attacl::text) order by a.attnum) from pg_attribute a left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped),
 'constraints',(select jsonb_agg(jsonb_build_object('name',q.conname,'def',pg_get_constraintdef(q.oid),'validated',q.convalidated,'deferrable',q.condeferrable,'deferred',q.condeferred) order by q.conname) from pg_constraint q where q.conrelid=c.oid and q.contype<>'n'),
 'indexes',(select jsonb_agg(jsonb_build_object('name',i.indexrelid::regclass::text,'def',pg_get_indexdef(i.indexrelid),'valid',i.indisvalid,'ready',i.indisready) order by i.indexrelid::regclass::text) from pg_index i where i.indrelid=c.oid),
 'policies',(select jsonb_agg(jsonb_build_object('name',q.polname,'command',q.polcmd,'permissive',q.polpermissive,'qual',pg_get_expr(q.polqual,q.polrelid),'check',pg_get_expr(q.polwithcheck,q.polrelid),'roles',array(select rolname from pg_roles where oid=any(q.polroles) order by rolname)) order by q.polname) from pg_policy q where q.polrelid=c.oid),
 'acl',(select jsonb_agg(jsonb_build_object('grantee',case when a.grantee=0 then 'PUBLIC' else pg_get_userbyid(a.grantee) end,'grantor',pg_get_userbyid(a.grantor),'privilege',a.privilege_type,'grantable',a.is_grantable) order by a.grantee=0,pg_get_userbyid(a.grantee),a.privilege_type) from aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a),
 'triggers',(select jsonb_agg(jsonb_build_object('name',t.tgname,'def',pg_get_triggerdef(t.oid),'enabled',t.tgenabled) order by t.tgname) from pg_trigger t where t.tgrelid=c.oid and not t.tgisinternal))
 from pg_class c where c.oid=to_regclass('public.seating_elements')),
 'functions',(select jsonb_agg(jsonb_build_object('signature',n.nspname||'.'||p.proname||'('||oidvectortypes(p.proargtypes)||')','body_md5',md5(replace(p.prosrc,chr(13),'')),'owner',pg_get_userbyid(p.proowner),'security_definer',p.prosecdef,'config',p.proconfig,'return_type',format_type(p.prorettype,null),'language',(select lanname from pg_language where oid=p.prolang),'kind',p.prokind,'strict',p.proisstrict,'volatility',p.provolatile,'args',pg_get_function_arguments(p.oid),
 'acl',(select jsonb_agg(jsonb_build_object('grantee',case when a.grantee=0 then 'PUBLIC' else pg_get_userbyid(a.grantee) end,'grantor',pg_get_userbyid(a.grantor),'privilege',a.privilege_type,'grantable',a.is_grantable) order by a.grantee=0,pg_get_userbyid(a.grantee),a.privilege_type) from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a)) order by n.nspname,p.proname)
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private') and p.proname in ('manage_seating_plan','manage_seating_table','manage_seating_element','seating_element_valid','seating_element_guard','seating_plan_guard','validate_seating_template','create_seating_plan_from_template','lock_seating_plan','lock_seating_project','seating_authorize','seating_geometry_fits','seating_template_guard')),
 'template_version_constraint',(select pg_get_constraintdef(oid) from pg_constraint where conrelid='public.seating_templates'::regclass and conname='seating_templates_version_check'),
 'plan_trigger',(select pg_get_triggerdef(oid) from pg_trigger where tgrelid='public.seating_plans'::regclass and tgname='seating_plan_guard' and tgenabled='O'),
 'template_trigger',(select pg_get_triggerdef(oid) from pg_trigger where tgrelid='public.seating_templates'::regclass and tgname='seating_template_guard' and tgenabled='O')
) as snapshot;
rollback;
