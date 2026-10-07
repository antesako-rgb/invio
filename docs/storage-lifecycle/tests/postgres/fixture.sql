-- ONLY the fresh local cluster created by run_postgres_tests.py. Synthetic schema.
create role anon;
create role authenticated;
create role service_role;
create schema private;
create table public.projects(id uuid primary key, owner_id uuid not null);
create table public.project_collaborators(project_id uuid references public.projects on delete cascade, profile_id uuid, primary key(project_id,profile_id));
create table public.invitations(id uuid primary key, project_id uuid not null references public.projects on delete cascade,
  public_id text unique, is_public boolean default true, published_at timestamptz default now(),
  document jsonb not null default '{"theme":"test","pages":[]}');
create table public.digital_albums(like public.invitations including defaults including constraints);
alter table public.digital_albums add primary key(id);
alter table public.digital_albums add foreign key(project_id) references public.projects on delete cascade;
create table public.photo_walls(like public.invitations including defaults including constraints);
alter table public.photo_walls add primary key(id);
alter table public.photo_walls add foreign key(project_id) references public.projects on delete cascade;
create table public.project_photos(id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects on delete cascade,
  image_path text not null, file_size bigint not null check(file_size>0), source_type text not null, source_id uuid not null, created_at timestamptz not null default now());
create table public.invitation_photos(invitation_id uuid references public.invitations on delete cascade,
  photo_id uuid references public.project_photos on delete cascade, description text, created_at timestamptz not null default now(), primary key(invitation_id,photo_id));
create table public.digital_album_photos(album_id uuid references public.digital_albums on delete cascade,
  photo_id uuid references public.project_photos on delete cascade, description text, created_at timestamptz not null default now(), primary key(album_id,photo_id));
create table public.photo_wall_photos(photo_wall_id uuid references public.photo_walls on delete cascade,
  photo_id uuid references public.project_photos on delete cascade, description text, is_favorite boolean not null default false,
  created_at timestamptz not null default now(), primary key(photo_wall_id,photo_id));
create function private.is_project_member(p_project uuid,p_actor uuid) returns boolean language sql as $$
  select exists(select 1 from public.projects where id=p_project and owner_id=p_actor)
    or exists(select 1 from public.project_collaborators where project_id=p_project and profile_id=p_actor);
$$;
create function private.invitation_document_photo_ids(p_document jsonb) returns setof uuid language sql as $$
  select (slot->>'photoId')::uuid from jsonb_array_elements(p_document->'pages') page
    cross join lateral jsonb_array_elements(page->'photos') slot where slot->>'photoId' is not null;
$$;
create function private.digital_album_document_photo_ids(p_document jsonb) returns setof uuid language sql as $$
  select (slot->>'photoId')::uuid from jsonb_array_elements(p_document->'pages') page
    cross join lateral jsonb_array_elements((page->'photos') || coalesce(page->'unplacedPhotos','[]')) slot
    where slot->>'photoId' is not null;
$$;
create function public.create_invitation_photo(uuid,text,bigint,text) returns void language sql as $$ select pg_sleep(0); $$;
create function public.create_digital_album_photo(uuid,text,bigint,text) returns void language sql as $$ select pg_sleep(0); $$;
insert into public.projects values ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002');
insert into public.invitations(id,project_id,public_id) values ('00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','test-invitation');
insert into public.digital_albums(id,project_id,public_id) values ('00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000001','test-album');
insert into public.photo_walls(id,project_id,public_id) values ('00000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000001','test-wall');
-- A genuine pre-activation legacy row; never uploaded or physically deleted.
insert into public.project_photos(id,project_id,image_path,file_size,source_type,source_id)
  values ('00000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000001','../unknown.webp',10,'invitation','00000000-0000-4000-8000-000000000003');
