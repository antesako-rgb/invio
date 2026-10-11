-- READ ONLY. Run after 007; no personal data returned.
begin read only;
do $verify$
declare p pg_proc;
begin
 select * into p from pg_proc where oid=to_regprocedure('public.assign_seating_guests(uuid,bigint,uuid[],uuid,text)');
 if not found then raise exception '007 RPC missing'; end if;
 if p.proowner<>'postgres'::regrole or not p.prosecdef or p.proconfig is distinct from array['search_path=""']::text[]
  or p.prorettype<>'bigint'::regtype or md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g'))<>'c94862c5435203fb7009f58f6ac83ee8'
  or has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('service_role',p.oid,'EXECUTE')
  or not has_function_privilege('authenticated',p.oid,'EXECUTE') then raise exception '007 RPC/security mismatch'; end if;
end $verify$;
select true as rpc_007_verified,has_function_privilege('authenticated','public.assign_seating_guests(uuid,bigint,uuid[],uuid,text)','EXECUTE') as member_execute;
select count(*) as invalid_seats from public.seating_assignments a join public.seating_tables t on t.plan_id=a.plan_id and t.id=a.table_id where a.seat_number<1 or a.seat_number>t.capacity;
select count(*) as tables_over_capacity from public.seating_tables t where (select count(*) from public.seating_assignments a where a.plan_id=t.plan_id and a.table_id=t.id)>t.capacity;
rollback;
