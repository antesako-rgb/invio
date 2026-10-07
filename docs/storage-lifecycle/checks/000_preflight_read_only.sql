-- =========================================
-- STORAGE LIFECYCLE PREFLIGHT
-- READ ONLY
--
-- No mutations.
-- No object paths or user data returned.
-- =========================================


-- =========================================
-- 1. CURRENT DATABASE ROLE
-- =========================================

select
  current_user,
  session_user;


-- =========================================
-- 2. TABLES / RLS / OWNERS
-- =========================================

select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,

  pg_get_userbyid(
    c.relowner
  ) as owner

from pg_class c

inner join pg_namespace n
  on n.oid =
    c.relnamespace

where n.nspname in (
    'public',
    'private'
  )

  and c.relname in (
    'projects',
    'project_photos',
    'invitation_photos',
    'digital_album_photos',
    'photo_wall_photos',
    'storage_objects',
    'storage_cleanup_jobs'
  )

order by
  n.nspname,
  c.relname;


-- =========================================
-- 3. PHOTO TABLE CONSTRAINTS
-- =========================================

select
  conrelid::regclass as table_name,
  conname as constraint_name,

  pg_get_constraintdef(
    oid
  ) as definition

from pg_constraint

where conrelid in (
  'public.project_photos'::regclass,
  'public.invitation_photos'::regclass,
  'public.digital_album_photos'::regclass,
  'public.photo_wall_photos'::regclass
)

order by
  conrelid,
  conname;


-- =========================================
-- 4. FUNCTION SECURITY / GRANTS / DEFINITIONS
-- =========================================

select
  p.oid::regprocedure as signature,

  p.prosecdef as security_definer,
  p.proconfig as function_config,

  has_function_privilege(
    'anon',
    p.oid,
    'EXECUTE'
  ) as anon_execute,

  has_function_privilege(
    'authenticated',
    p.oid,
    'EXECUTE'
  ) as authenticated_execute,

  has_function_privilege(
    'service_role',
    p.oid,
    'EXECUTE'
  ) as service_execute,

  pg_get_functiondef(
    p.oid
  ) as definition

from pg_proc p

inner join pg_namespace n
  on n.oid =
    p.pronamespace

where n.nspname in (
    'public',
    'private'
  )

  and p.prokind = 'f'

  and p.proname in (
    'add_invitation_photos',
    'add_digital_album_photos',
    'remove_invitation_photo',
    'remove_digital_album_photo',
    'remove_photo_wall_photo',
    'update_invitation_document',
    'update_digital_album_document',
    'invitation_document_photo_ids',
    'digital_album_document_photo_ids',
    'delete_project',
    'delete_invitation',
    'delete_digital_album'
  )

order by
  p.oid::regprocedure::text;


-- =========================================
-- 5. PHOTO COUNT / AMBIGUOUS PATH COUNT
-- =========================================

select
  count(*) as photos,

  count(*) filter (
    where trim(
      both '/' from image_path
    ) !~ '^[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*\.[A-Za-z0-9]+$'
  ) as ambiguous_path_count

from public.project_photos;


-- =========================================
-- 6. DUPLICATE NORMALIZED PATH COUNTS
--
-- Counts identify review work.
-- They do not prove ownership of any path.
-- =========================================

select
  count(*) as alias_groups,

  coalesce(
    sum(aliases),
    0
  ) as aliased_rows

from (
  select
    count(*) as aliases

  from public.project_photos

  group by
    trim(
      both '/' from image_path
    )

  having
    count(*) > 1
) aliases;