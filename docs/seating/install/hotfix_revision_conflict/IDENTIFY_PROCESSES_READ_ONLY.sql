-- READ ONLY. Inspect twice and match pid to process_id in RECENT Postgres logs.
-- Also match log user_name=authenticator, SQLSTATE=40001 and Revision conflict.
-- These are CANDIDATES, not proof of looping. Do not terminate all returned rows.
-- Query text/parameters are intentionally omitted to avoid personal data/tokens.
begin read only;
select now() as inspected_at,pid,backend_start,query_start,xact_start,
 usename,application_name,backend_type,state,wait_event_type,wait_event,
 md5(query) as query_fingerprint,
 case
  when query ilike '%sync_seating_rsvp_guests%' then 'sync_seating_rsvp_guests'
  when query ilike '%assign_seating_guests_to_seats%' then 'assign_seating_guests_to_seats'
  when query ilike '%assign_seating_guests%' then 'assign_seating_guests'
  when query ilike '%assign_seating_guest_to_seat%' then 'assign_seating_guest_to_seat'
  when query ilike '%assign_seating_guest%' then 'assign_seating_guest'
  when query ilike '%include_generic_seating_guest%' then 'include_generic_seating_guest'
  when query ilike '%manage_seating_participant%' then 'manage_seating_participant'
  when query ilike '%manage_seating_table%' then 'manage_seating_table'
  when query ilike '%manage_seating_plan%' then 'manage_seating_plan'
 end as seating_rpc
from pg_stat_activity
where datname=current_database() and usename='authenticator'
 and application_name like 'PostgREST%'
 and backend_type='client backend' and pid<>pg_backend_pid()
 and query ~* '(sync_seating_rsvp_guests|assign_seating_guest|include_generic_seating_guest|manage_seating_(participant|table|plan))'
order by query_start,pid;
select now() as inspected_at,stats_reset,xact_commit,xact_rollback,deadlocks
from pg_stat_database where datname=current_database();
rollback;
