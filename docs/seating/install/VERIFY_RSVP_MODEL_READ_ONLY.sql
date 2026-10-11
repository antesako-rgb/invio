-- READ ONLY after setup; no personal data returned.
begin read only;
set local search_path=pg_catalog,public;
do $verify$
declare v record; p pg_proc;
begin
 if not exists(select 1 from pg_class where oid=to_regclass('private.seating_rsvp_exclusions')
  and relowner='postgres'::regrole and relrowsecurity)
  or exists(select 1 from pg_policy where polrelid='private.seating_rsvp_exclusions'::regclass)
  or has_table_privilege('anon','private.seating_rsvp_exclusions','SELECT,INSERT,UPDATE,DELETE')
  or has_table_privilege('authenticated','private.seating_rsvp_exclusions','SELECT,INSERT,UPDATE,DELETE')
  or has_table_privilege('service_role','private.seating_rsvp_exclusions','SELECT,INSERT,UPDATE,DELETE') then
  raise exception 'Private exclusion table security mismatch';
 end if;
 if (select count(*) from pg_constraint where conrelid='private.seating_rsvp_exclusions'::regclass and convalidated and (
  (conname='seating_rsvp_exclusions_pk' and contype='p' and pg_get_constraintdef(oid)='PRIMARY KEY (plan_id, project_guest_id)')
  or (conname='seating_rsvp_exclusions_plan_fk' and contype='f' and pg_get_constraintdef(oid)='FOREIGN KEY (project_id, plan_id) REFERENCES seating_plans(project_id, id) ON DELETE CASCADE')
  or (conname='seating_rsvp_exclusions_person_fk' and contype='f' and pg_get_constraintdef(oid)='FOREIGN KEY (project_id, project_guest_id) REFERENCES project_guests(project_id, id) ON DELETE CASCADE')
 ))<>3 then raise exception 'Private exclusion constraints mismatch'; end if;
 for v in select * from (values
  ('public.manage_seating_participant(uuid,bigint,uuid,text)','ae2cb613034af220ca9a78a1dca3d367','bigint'),
  ('public.sync_seating_rsvp_guests(uuid,uuid,bigint)','94a12292ea88fef8510bce00866ed9ae','jsonb')
 ) f(signature,source_md5,result_type) loop
  select * into p from pg_proc where oid=to_regprocedure(v.signature);
  if not found then raise exception 'RSVP function missing: %',v.signature; end if;
  if p.proowner<>'postgres'::regrole or not p.prosecdef or p.proconfig is distinct from array['search_path=""']::text[]
   or p.prolang<>(select oid from pg_language where lanname='plpgsql') or p.prorettype<>v.result_type::regtype
   or md5(regexp_replace(p.prosrc,'[[:space:]]+',' ','g'))<>v.source_md5
   or has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('service_role',p.oid,'EXECUTE')
   or not has_function_privilege('authenticated',p.oid,'EXECUTE') then raise exception 'RSVP function/security mismatch: %',v.signature; end if;
 end loop;
end $verify$;
select true as rsvp_model_verified,has_function_privilege('authenticated','public.sync_seating_rsvp_guests(uuid,uuid,bigint)','EXECUTE') as member_execute;
rollback;
