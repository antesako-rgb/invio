-- READ ONLY, after 008. No guest data returned.
begin read only;
do $verify$
declare p pg_proc;
begin
 select * into p from pg_proc where oid=to_regprocedure('public.assign_seating_guests_to_seats(uuid,bigint,uuid,jsonb)');
 if not found then raise exception '008 RPC missing'; end if;
 if p.proowner<>'postgres'::regrole or not p.prosecdef or p.proconfig is distinct from array['search_path=""']::text[]
  or p.prorettype<>'bigint'::regtype or md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g'))<>'31a6854903f834bb73f062cc70e2f217'
  or has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('service_role',p.oid,'EXECUTE')
  or not has_function_privilege('authenticated',p.oid,'EXECUTE') then raise exception '008 RPC/security mismatch'; end if;
end $verify$;
select true as rpc_008_verified,has_function_privilege('authenticated','public.assign_seating_guests_to_seats(uuid,bigint,uuid,jsonb)','EXECUTE') as member_execute;
rollback;
