-- Complete the SAME transaction, after all 001-003.
do $$ begin
 if exists(select 1 from public.invitation_guests g left join public.project_guests p on p.id=g.project_guest_id and p.project_id=g.project_id where p.id is null or g.first_name is distinct from p.first_name or g.last_name is distinct from p.last_name) then raise exception 'Backfill mismatch'; end if;
 if (select count(*) from public.project_guests)<>(select count(*) from public.invitation_guests) then raise exception 'Unexpected identity count'; end if;
 if exists(select 1 from public.invitation_generic_guest_links) then raise exception 'Generic links must begin empty'; end if;
end $$;
commit;
