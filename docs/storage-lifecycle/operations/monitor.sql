-- READ ONLY. No credentials, headers, signatures, tokens, or response contents.
select jobid,jobname,schedule,active,username from cron.job where jobname='memora-storage-cleanup';
select status,start_time,end_time from cron.job_run_details
where jobid in(select jobid from cron.job where jobname='memora-storage-cleanup')
order by start_time desc limit 10;
select id,status_code,timed_out,error_msg,created from net._http_response order by id desc limit 10;
select state,count(*) from private.storage_objects group by state;
select state,count(*) from private.storage_cleanup_jobs group by state;
select o.id,o.kind,o.state as object_state,j.state as job_state,j.attempts,j.lease_until,j.next_attempt_at,
 private.storage_has_references(o.storage_key) as has_references
from private.storage_cleanup_jobs j join private.storage_objects o on o.id=j.object_id
where j.state<>'done';

-- Pending upload metadata only; age alone never authorizes DELETE.
select id,kind,state,created_at,clock_timestamp()-created_at as age
from private.storage_objects where state='pending' order by created_at limit 50;
-- Backlog and expired leases, no object paths/tokens.
select count(*) filter(where state='pending') as pending_jobs,
 count(*) filter(where state='leased') as leased_jobs,
 count(*) filter(where state='leased' and lease_until<=now()) as expired_leases,
 min(created_at) filter(where state<>'done') as oldest_unfinished
from private.storage_cleanup_jobs;
