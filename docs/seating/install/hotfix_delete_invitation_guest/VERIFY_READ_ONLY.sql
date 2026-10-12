-- READ ONLY: catalog-only structural PASS/FAIL; does NOT call a guest RPC.
-- Confirms the exact reviewed body and security, not runtime/HTTP behavior.
begin read only;
set local search_path = pg_catalog, public;

do $verify$
declare
  p pg_proc;
  target_literal constant text := 'errcode = ''PT409''';
begin
  select * into p from pg_proc
  where oid = to_regprocedure('public.delete_invitation_guest(uuid)');
  if not found then raise exception 'FAIL: delete_invitation_guest missing'; end if;

  if md5(replace(p.prosrc, chr(13), '')) <> '75ca837ef7cd32a89d895ae474d0cd1a'
    or strpos(p.prosrc, '40001') > 0
    or (length(p.prosrc) - length(replace(p.prosrc, target_literal, ''))) / length(target_literal) <> 1
    or p.proowner <> 'postgres'::regrole
    or not p.prosecdef
    or p.proconfig is distinct from array['search_path=""']::text[]
    or p.prorettype <> 'uuid'::regtype
    or p.prokind <> 'f'
    or p.prolang <> (select oid from pg_language where lanname = 'plpgsql')
    or p.proargnames is distinct from array['p_guest_id']::text[]
    or p.pronargdefaults <> 0
    or p.proacl is distinct from array['postgres=X/postgres', 'authenticated=X/postgres']::aclitem[]
    or has_function_privilege('anon', p.oid, 'EXECUTE')
    or not has_function_privilege('authenticated', p.oid, 'EXECUTE')
    or has_function_privilege('service_role', p.oid, 'EXECUTE')
    or exists (
      select 1 from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
      where a.grantee = 0 and a.privilege_type = 'EXECUTE'
    ) then
    raise exception 'FAIL: delete_invitation_guest source/security mismatch';
  end if;
end $verify$;

select true as delete_invitation_guest_hotfix_verified,
  'PT409'::text as business_conflict_sqlstate;
rollback;
