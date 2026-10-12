-- MANUAL REVIEW/EXECUTION ONLY. Codex has NOT executed this file.
-- Target: Memora DEV gdrwvoryapkgnfeislps; confirm Dashboard project yourself.
-- This body/security guard is NOT a reliable Supabase project identity check.
-- Deploy compatible invitationGuestError handling first; pause guest mutations
-- and concurrent function DDL. Run this WHOLE file once as postgres.
-- On any error: issue ROLLBACK separately, inspect, do not remove the guards.
-- Only one business-conflict SQLSTATE changes; storage_lock is untouched.
begin;
set local search_path = pg_catalog, public;
set local lock_timeout = '5s';
set local statement_timeout = '15s';

do $hotfix$
declare
  p pg_proc;
  updated pg_proc;
  target_literal constant text := 'errcode = ''40001''';
  replacement_literal constant text := 'errcode = ''PT409''';
  expected_source text;
  definition text;
begin
  if current_user <> 'postgres' then
    raise exception 'Run reviewed hotfix as postgres';
  end if;

  select * into p from pg_proc
  where oid = to_regprocedure('public.delete_invitation_guest(uuid)');
  if not found then raise exception 'delete_invitation_guest missing'; end if;

  -- Exact body, allowing only CRLF/LF differences; do not ignore other whitespace.
  if md5(replace(p.prosrc, chr(13), '')) <> '7f3ed7d65b2d17a05e46e8c0a64a1e13'
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
    raise exception 'Baseline/security mismatch or already patched: inspect; do not remove guards';
  end if;

  if (length(p.prosrc) - length(replace(p.prosrc, target_literal, ''))) / length(target_literal) <> 1
    or (length(p.prosrc) - length(replace(p.prosrc, '''40001''', ''))) / length('''40001''') <> 1
    or strpos(p.prosrc, 'PT409') > 0 then
    raise exception 'Expected exactly one targeted SQLSTATE literal';
  end if;

  expected_source := replace(p.prosrc, target_literal, replacement_literal);
  if md5(replace(expected_source, chr(13), '')) <> '75ca837ef7cd32a89d895ae474d0cd1a' then
    raise exception 'Unexpected candidate body';
  end if;

  definition := pg_get_functiondef(p.oid);
  if (length(definition) - length(replace(definition, target_literal, ''))) / length(target_literal) <> 1 then
    raise exception 'Expected exactly one target in function definition';
  end if;
  execute replace(definition, target_literal, replacement_literal);

  select * into updated from pg_proc where oid = p.oid;
  if not found then raise exception 'Updated function missing'; end if;
  if updated.prosrc is distinct from expected_source
    or (to_jsonb(updated) - 'prosrc') is distinct from (to_jsonb(p) - 'prosrc') then
    raise exception 'Unexpected source/metadata/ACL change; transaction aborted';
  end if;
end $hotfix$;

-- No signature/grants change, guest RPC invocation or schema reload.
commit;
