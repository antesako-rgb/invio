-- FINAL MODEL DEFINITION. Private state, not guest migration or a client table.
-- Apply the reviewed empty-model setup; do not run definitions separately on an installed model.
create table private.seating_rsvp_exclusions (
 project_id uuid not null,
 plan_id uuid not null,
 project_guest_id uuid not null,
 constraint seating_rsvp_exclusions_pk primary key(plan_id,project_guest_id),
 constraint seating_rsvp_exclusions_plan_fk foreign key(project_id,plan_id)
  references public.seating_plans(project_id,id) on delete cascade,
 constraint seating_rsvp_exclusions_person_fk foreign key(project_id,project_guest_id)
  references public.project_guests(project_id,id) on delete cascade
);
create index seating_rsvp_exclusions_project_idx on private.seating_rsvp_exclusions(project_id);
create index seating_rsvp_exclusions_person_idx on private.seating_rsvp_exclusions(project_guest_id);
alter table private.seating_rsvp_exclusions enable row level security;
revoke all on private.seating_rsvp_exclusions from public,anon,authenticated,service_role;
