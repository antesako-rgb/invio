-- REVIEWED PACKAGE CANDIDATE; NOT EXECUTED. Run all 001-004 on same connection in one transaction.
-- Stop guest/RSVP writes first. 001 opens transaction; ONLY 004 commits.
begin;
lock table public.projects,public.invitations,public.invitation_guests,public.invitation_recipients,public.invitation_guest_groups,public.rsvp_responses,public.rsvp_response_guests in access exclusive mode;
do $preflight$ begin
 if current_user <> 'postgres' then raise exception 'Run reviewed installation as postgres'; end if;
 if current_setting('server_version_num')::integer < 150000 then raise exception 'PostgreSQL 15+ required for column-specific SET NULL'; end if;
 if to_regclass('public.project_guests') is not null then raise exception 'Existing project_guests: inspect before migration'; end if;
 if to_regprocedure('public.create_invitation_guest(uuid,uuid,text,text,text)') is null or md5(regexp_replace(pg_get_functiondef(to_regprocedure('public.create_invitation_guest(uuid,uuid,text,text,text)')), '[[:space:]]+', ' ', 'g')) <> 'ed80b5792f049a02450b35776438e7db' then raise exception 'Baseline changed: public.create_invitation_guest(uuid,uuid,text,text,text)'; end if;
 if to_regprocedure('public.update_invitation_guest(uuid,uuid,text,text,text)') is null or md5(regexp_replace(pg_get_functiondef(to_regprocedure('public.update_invitation_guest(uuid,uuid,text,text,text)')), '[[:space:]]+', ' ', 'g')) <> 'e0a1516fac1615de80115556c847e24e' then raise exception 'Baseline changed: public.update_invitation_guest(uuid,uuid,text,text,text)'; end if;
 if to_regprocedure('public.get_public_rsvp(text)') is null or md5(regexp_replace(pg_get_functiondef(to_regprocedure('public.get_public_rsvp(text)')), '[[:space:]]+', ' ', 'g')) <> '2a248b1e0e450aa650c12e4b962acecb' then raise exception 'Baseline changed: public.get_public_rsvp(text)'; end if;
 if to_regprocedure('public.delete_invitation_guest(uuid)') is null or md5(regexp_replace(pg_get_functiondef(to_regprocedure('public.delete_invitation_guest(uuid)')), '[[:space:]]+', ' ', 'g')) <> 'e3dcf9ebe324052a578f989a308fad5a' then raise exception 'Baseline changed: public.delete_invitation_guest(uuid)'; end if;
end $preflight$;
create table public.project_guests (
 id uuid not null default gen_random_uuid(),
 project_id uuid not null,
 first_name text not null,
 last_name text,
 notes text,
 archived_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.project_guests add constraint project_guests_c1 primary key(id);
alter table public.project_guests add constraint project_guests_c2 foreign key(project_id) references public.projects(id) on delete cascade;
alter table public.project_guests add constraint project_guests_c3 check(char_length(trim(first_name)) between 1 and 100);
alter table public.project_guests add constraint project_guests_c4 check(last_name is null or char_length(trim(last_name)) between 1 and 100);
alter table public.project_guests add constraint project_guests_c5 check(notes is null or char_length(notes)<=2000);
alter table public.project_guests add constraint project_guests_c6 unique(project_id,id);
alter table public.invitation_guests add column project_guest_id uuid;
alter table public.invitation_guests add constraint invitation_guests_project_person_fk foreign key(project_id,project_guest_id) references public.project_guests(project_id,id) on delete no action deferrable initially deferred;
alter table public.invitation_guests add constraint invitation_guests_one_person_per_invitation unique(invitation_id,project_guest_id);
alter table public.invitation_guests add constraint invitation_guests_person_identity unique(project_id,invitation_id,project_guest_id);
alter table public.rsvp_response_guests add constraint rsvp_response_guests_link_identity unique(project_id,invitation_id,response_id,id);create table public.invitation_generic_guest_links (
 project_id uuid not null,
 invitation_id uuid not null,
 response_id uuid not null,
 response_guest_id uuid not null,
 project_guest_id uuid not null,
 created_at timestamptz not null default now()
);
alter table public.invitation_generic_guest_links add constraint invitation_generic_guest_links_c1 primary key(response_guest_id);
alter table public.invitation_generic_guest_links add constraint invitation_generic_guest_links_c2 foreign key(project_id,invitation_id,response_id,response_guest_id)
 references public.rsvp_response_guests(project_id,invitation_id,response_id,id) on delete cascade;
alter table public.invitation_generic_guest_links add constraint invitation_generic_guest_links_c3 foreign key(project_id,project_guest_id) references public.project_guests(project_id,id) on delete no action deferrable initially deferred;
alter table public.invitation_generic_guest_links add constraint invitation_generic_guest_links_c4 unique(response_id,project_guest_id);
alter table public.invitation_generic_guest_links add constraint generic_link_invitation_person_fk foreign key(project_id,invitation_id,project_guest_id) references public.invitation_guests(project_id,invitation_id,project_guest_id) on delete cascade;
create table public.seating_plans (
 id uuid not null default gen_random_uuid(),
 project_id uuid not null,
 name text not null,
 rsvp_invitation_id uuid,
 width_cm integer not null,
 height_cm integer not null,
 revision bigint not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.seating_plans add constraint seating_plans_c1 primary key(id);
alter table public.seating_plans add constraint seating_plans_c2 foreign key(project_id) references public.projects(id) on delete cascade;
alter table public.seating_plans add constraint seating_plans_c3 check(char_length(trim(name)) between 1 and 150);
alter table public.seating_plans add constraint seating_plans_c4 check(width_cm between 100 and 100000);
alter table public.seating_plans add constraint seating_plans_c5 check(height_cm between 100 and 100000);
alter table public.seating_plans add constraint seating_plans_c6 check(revision>=1);
alter table public.seating_plans add constraint seating_plans_c7 unique(project_id,id);
alter table public.seating_plans add constraint seating_plans_c8 foreign key(project_id,rsvp_invitation_id) references public.invitations(project_id,id)
 on delete set null (rsvp_invitation_id);
create table public.seating_plan_guests (
 project_id uuid not null,
 plan_id uuid not null,
 project_guest_id uuid not null
);
alter table public.seating_plan_guests add constraint seating_plan_guests_c1 primary key(plan_id,project_guest_id);
alter table public.seating_plan_guests add constraint seating_plan_guests_c2 unique(project_id,plan_id,project_guest_id);
alter table public.seating_plan_guests add constraint seating_plan_guests_c3 foreign key(project_id,plan_id) references public.seating_plans(project_id,id) on delete cascade;
alter table public.seating_plan_guests add constraint seating_plan_guests_c4 foreign key(project_id,project_guest_id) references public.project_guests(project_id,id) on delete no action deferrable initially deferred;
create table public.seating_tables (
 id uuid not null default gen_random_uuid(),
 project_id uuid not null,
 plan_id uuid not null,
 name text not null,
 shape text not null,
 capacity integer not null,
 x_cm integer not null,
 y_cm integer not null,
 width_cm integer not null,
 height_cm integer not null,
 rotation_deg integer not null default 0
);
alter table public.seating_tables add constraint seating_tables_c1 primary key(id);
alter table public.seating_tables add constraint seating_tables_c2 check(char_length(trim(name)) between 1 and 150);
alter table public.seating_tables add constraint seating_tables_c3 check(shape in ('round','rectangle'));
alter table public.seating_tables add constraint seating_tables_c4 check(capacity between 1 and 100);
alter table public.seating_tables add constraint seating_tables_c5 check(x_cm between 0 and 100000);
alter table public.seating_tables add constraint seating_tables_c6 check(y_cm between 0 and 100000);
alter table public.seating_tables add constraint seating_tables_c7 check(width_cm between 10 and 10000);
alter table public.seating_tables add constraint seating_tables_c8 check(height_cm between 10 and 10000);
alter table public.seating_tables add constraint seating_tables_c9 check(rotation_deg between 0 and 359);
alter table public.seating_tables add constraint seating_tables_c10 unique(project_id,plan_id,id);
alter table public.seating_tables add constraint seating_tables_c11 foreign key(project_id,plan_id) references public.seating_plans(project_id,id) on delete cascade;
create table public.seating_assignments (
 project_id uuid not null,
 plan_id uuid not null,
 project_guest_id uuid not null,
 table_id uuid not null
);
alter table public.seating_assignments add constraint seating_assignments_c1 primary key(plan_id,project_guest_id);
alter table public.seating_assignments add constraint seating_assignments_c2 foreign key(project_id,plan_id,project_guest_id)
 references public.seating_plan_guests(project_id,plan_id,project_guest_id) on delete cascade;
alter table public.seating_assignments add constraint seating_assignments_c3 foreign key(project_id,plan_id,table_id)
 references public.seating_tables(project_id,plan_id,id) on delete cascade;
insert into public.project_guests(id,project_id,first_name,last_name,created_at,updated_at) select id,project_id,first_name,last_name,created_at,updated_at from public.invitation_guests;
update public.invitation_guests set project_guest_id=id;
set constraints invitation_guests_project_person_fk immediate;
alter table public.invitation_guests alter column project_guest_id set not null;
set constraints invitation_guests_project_person_fk deferred;

-- NEW: database-managed seating templates (catalog starts empty).
create table public.seating_templates (
 id uuid not null default gen_random_uuid(),
 name text not null,
 slug text not null,
 description text,
 document jsonb not null,
 document_version integer not null default 1,
 is_active boolean not null default false,
 sort_order integer not null default 0,
 event_type text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.seating_templates add constraint seating_templates_pkey primary key(id);
alter table public.seating_templates add constraint seating_templates_slug_key unique(slug);
alter table public.seating_templates add constraint seating_templates_name_check check(char_length(trim(name)) between 1 and 150);
alter table public.seating_templates add constraint seating_templates_slug_check check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug)<=150);
alter table public.seating_templates add constraint seating_templates_description_check check(description is null or char_length(description)<=2000);
alter table public.seating_templates add constraint seating_templates_version_check check(document_version=1);
alter table public.seating_templates add constraint seating_templates_document_check check(jsonb_typeof(document)='object');
alter table public.seating_templates add constraint seating_templates_sort_order_check check(sort_order>=0);
alter table public.seating_templates add constraint seating_templates_event_type_check check(event_type is null or event_type in ('wedding','birthday','baptism','communion','confirmation','business','other'));
