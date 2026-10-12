-- READ ONLY: catalog-only structural PASS/FAIL; does NOT call a storage RPC.
-- Confirms the exact reviewed body and security, not runtime/HTTP behavior.
begin read only;
set local search_path = pg_catalog, public;

do $verify$
declare
  p pg_proc;
  target_literal constant text := 'errcode = ''PT503''';
begin
  select * into p from pg_proc
  where oid = to_regprocedure('private.storage_lock()');
  if not found then raise exception 'FAIL: storage_lock missing'; end if;

  if md5(replace(p.prosrc, chr(13), '')) <> '167fc0624f3dbedbe6d4c90096e8dffc'
    or strpos(p.prosrc, '40001') > 0
    or (length(p.prosrc) - length(replace(p.prosrc, target_literal, ''))) / length(target_literal) <> 1
    or p.proowner <> 'postgres'::regrole
    or p.prosecdef
    or p.proconfig is distinct from array['search_path=""']::text[]
    or p.prorettype <> 'void'::regtype
    or p.prokind <> 'f'
    or p.prolang <> (select oid from pg_language where lanname = 'plpgsql')
    or p.pronargs <> 0
    or p.pronargdefaults <> 0
    or p.proacl is distinct from array['postgres=X/postgres']::aclitem[]
    or has_function_privilege('anon', p.oid, 'EXECUTE')
    or has_function_privilege('authenticated', p.oid, 'EXECUTE')
    or has_function_privilege('service_role', p.oid, 'EXECUTE')
    or exists (
      select 1 from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
      where a.grantee = 0 and a.privilege_type = 'EXECUTE'
    ) then
    raise exception 'FAIL: storage_lock source/security mismatch';
  end if;
end $verify$;

select true as storage_lock_hotfix_verified,
  'PT503'::text as storage_busy_sqlstate;
rollback;
