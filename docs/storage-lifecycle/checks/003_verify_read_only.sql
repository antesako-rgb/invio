-- READ ONLY after install 001-018, valid before/after optional legacy removal.
-- Run as postgres in SQL Editor: private helpers are not executable by clients.
select n.nspname, c.relname, c.relrowsecurity, pg_get_userbyid(c.relowner) as owner
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'private' and c.relname in ('storage_objects','storage_cleanup_jobs','storage_legacy_review');

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies where schemaname = 'private' and tablename in ('storage_objects','storage_cleanup_jobs','storage_legacy_review');

select r.role_name, t.table_name,
  has_table_privilege(r.role_name,t.table_name,'SELECT,INSERT,UPDATE,DELETE') as has_any_privilege
from (values ('anon'),('authenticated'),('service_role')) r(role_name)
cross join (values ('private.storage_objects'),('private.storage_cleanup_jobs'),('private.storage_legacy_review')) t(table_name);
-- All false: access to the private ledger is only through owner-backed RPCs.

select p.oid::regprocedure as signature, pg_get_userbyid(p.proowner) as owner,
  p.prosecdef, p.proconfig,
  has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
  has_function_privilege('authenticated',p.oid,'EXECUTE') as auth_execute,
  has_function_privilege('service_role',p.oid,'EXECUTE') as service_execute
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public','private') and (
  p.proname like 'storage_%'
) order by signature::text;
-- New public storage RPCs: anon/auth false, service true, definer true, empty path.
-- Legacy registration RPCs must be absent. Private helpers: anon/auth false.

select c.relname, t.tgname, pg_get_triggerdef(t.oid) as definition
from pg_trigger t join pg_class c on c.oid = t.tgrelid
where not t.tgisinternal and t.tgname in ('storage_photo_guard','storage_link_guard','storage_unlinked','storage_project_deleted','storage_document_guard');
-- Ten triggers: photo guard, three link guards, three unlink hooks, project hook, two document guards.

select conrelid::regclass as table_name, conname, pg_get_constraintdef(oid)
from pg_constraint where conrelid in ('private.storage_objects'::regclass,'private.storage_cleanup_jobs'::regclass,'private.storage_legacy_review'::regclass);
-- No ledger/project FK; the job references ONLY the durable ledger.

select state, count(*) from private.storage_objects group by state;
select state, count(*) from private.storage_cleanup_jobs group by state;
select count(*) as archived_legacy_rows_for_review from private.storage_legacy_review;
select count(*) as illegal_active_job from private.storage_cleanup_jobs j
join private.storage_objects o on o.id = j.object_id
where j.state <> 'done' and o.state not in ('deleting','quarantined');
select count(*) as linked_deleting_objects from private.storage_objects o
where o.state in ('deleting','deleted') and private.storage_has_references(o.storage_key);
select count(*) as legacy_rows_not_adopted from public.project_photos p
where not exists (select 1 from private.storage_objects o where o.id = p.id and o.storage_key = p.image_path);
select count(*) as document_references_without_public_photo from private.storage_objects o
where not exists (select 1 from public.project_photos p where p.id = o.id)
  and private.storage_has_references(o.storage_key);
-- Includes references by ledger ID even after removal of the public row.
-- No key/path/contact/credential values are returned.

-- Legacy presence is explicit: no row in pg_proc is not a missing result.
select signature, to_regprocedure(signature) is null as removed
from (values ('public.create_invitation_photo(uuid,text,bigint,text)'),
             ('public.create_digital_album_photo(uuid,text,bigint,text)')) f(signature);
-- Both removed=true is expected. Zero old-function rows alone is not full verify.
