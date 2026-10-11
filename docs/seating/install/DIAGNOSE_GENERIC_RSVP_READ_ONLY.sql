-- READ ONLY. Diagnostic for the response guest supplied by the user.
-- Returns IDs/status/relationship flags only; no names, contacts or RSVP answers.
begin read only;
select
 g.id as response_guest_id,
 g.status,
 r.id as response_id,
 r.response_type,
 r.invitation_id,
 r.project_id,
 (r.id is not null) as response_parent_exists,
 (r.response_type='generic'
  and r.invitation_id='6220e82f-7c48-4f84-9565-9c76559ac7dd'::uuid
  and r.project_id='9fa3d6a9-db94-44c0-9f57-3baa06054ea9'::uuid) as matches_generic_ui_query,
 (g.project_id=r.project_id and g.invitation_id=r.invitation_id) as response_scope_matches,
 g.invitation_guest_id,
 l.project_guest_id,
 (p.id is not null) as linked_project_person_exists,
 (p.archived_at is not null) as linked_person_archived,
 (i.id is not null) as linked_invitation_guest_exists
from public.rsvp_response_guests g
left join public.rsvp_responses r on r.id=g.response_id
left join public.invitation_generic_guest_links l on l.response_guest_id=g.id
left join public.project_guests p on p.id=l.project_guest_id and p.project_id=g.project_id
left join public.invitation_guests i on i.project_guest_id=l.project_guest_id
 and i.project_id=g.project_id and i.invitation_id=g.invitation_id
where g.id='215bb265-a759-4524-aa74-1a49fa011309'::uuid;

select p.id as plan_id,
 (p.rsvp_invitation_id='6220e82f-7c48-4f84-9565-9c76559ac7dd'::uuid) as uses_this_invitation,
 exists(select 1 from public.seating_plan_guests m
  join public.invitation_generic_guest_links l on l.project_guest_id=m.project_guest_id
  where m.plan_id=p.id and l.response_guest_id='215bb265-a759-4524-aa74-1a49fa011309'::uuid) as guest_in_plan,
 exists(select 1 from private.seating_rsvp_exclusions e
  join public.invitation_generic_guest_links l on l.project_guest_id=e.project_guest_id
  where e.plan_id=p.id and l.response_guest_id='215bb265-a759-4524-aa74-1a49fa011309'::uuid) as explicitly_removed_from_plan
from public.seating_plans p
where p.project_id='9fa3d6a9-db94-44c0-9f57-3baa06054ea9'::uuid;
rollback;
