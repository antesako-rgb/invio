-- Final definition. Use the reviewed empty attendance setup on an installed model.
create table public.invitation_attendance_overrides (
 project_id uuid not null,
 invitation_id uuid not null,
 project_guest_id uuid not null,
 status text not null check(status in ('attending','not_attending')),
 updated_by uuid not null,
 updated_at timestamptz not null default now(),
 constraint invitation_attendance_overrides_pk primary key(invitation_id,project_guest_id),
 constraint invitation_attendance_overrides_guest_fk foreign key(project_id,invitation_id,project_guest_id)
  references public.invitation_guests(project_id,invitation_id,project_guest_id) on delete cascade
);
create index invitation_attendance_overrides_project_idx on public.invitation_attendance_overrides(project_id);
alter table public.invitation_attendance_overrides enable row level security;
create policy invitation_attendance_overrides_member_select on public.invitation_attendance_overrides
 for select to authenticated using(private.is_project_member(project_id));
revoke all on public.invitation_attendance_overrides from public,anon,authenticated,service_role;
grant select on public.invitation_attendance_overrides to authenticated;
