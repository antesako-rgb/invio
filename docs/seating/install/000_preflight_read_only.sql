-- READ ONLY preflight; existing project_guests means stop and inspect, never drop it.
select to_regclass('public.project_guests') as existing_project_guests;
select version();
select count(*) as invitation_guest_count from public.invitation_guests;
select count(*) as generic_response_guest_count from public.rsvp_response_guests where invitation_guest_id is null;
