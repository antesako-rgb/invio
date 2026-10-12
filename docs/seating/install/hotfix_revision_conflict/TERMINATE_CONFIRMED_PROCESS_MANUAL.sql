-- MUTATING OPERATION. NOT executed by Codex. Manual review and authorization only.
-- Fill ALL four values from a NEW identification query. Confirm the same pid is
-- process_id in RECENT repeated 40001 Revision conflict logs before running.
-- NULL placeholders make this file inert. Never reuse an old incident PID.
-- Termination rolls back that backend's open transaction and disconnects it.
-- Narrow guards reduce PID-reuse risk but cannot eliminate the observation race.
with confirmed(pid,backend_start,query_start,query_fingerprint) as (
 values (null::integer,null::timestamptz,null::timestamptz,null::text)
)
select a.pid,pg_terminate_backend(a.pid) as terminated
from pg_stat_activity a join confirmed c
 on a.pid=c.pid and a.backend_start=c.backend_start
 and a.query_start=c.query_start and md5(a.query)=c.query_fingerprint
where a.datname=current_database() and a.usename='authenticator'
 and a.application_name like 'PostgREST%' and a.backend_type='client backend'
 and a.pid<>pg_backend_pid()
 and a.query ~* '(sync_seating_rsvp_guests|assign_seating_guest|include_generic_seating_guest|manage_seating_(participant|table|plan))';
-- Zero rows: nothing was terminated. Re-identify; do not loosen the guards.
