-- READ ONLY: does not decrypt or show secrets/request headers.
select name,installed_version from pg_available_extensions
where name in ('pg_cron','pg_net','supabase_vault');
select n.nspname,p.proname,pg_get_function_identity_arguments(p.oid)
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname in ('cron','net') and p.proname in ('schedule','alter_job','http_post');
-- Run following only after extensions and inactive job are installed.
select jobid,jobname,schedule,active,username from cron.job
where jobname='memora-storage-cleanup';
-- Expected exactly one row, schedule */5 * * * *, active=false, username=postgres.
select count(*) as named_secret_count from vault.secrets
where name='memora_storage_cleanup_secret';
select jobid,status,start_time,end_time from cron.job_run_details
where jobid in(select jobid from cron.job where jobname='memora-storage-cleanup')
order by start_time desc limit 10;
-- Cron success means request queued, NOT HTTP success or files deleted.
select id,status_code,timed_out,error_msg,created from net._http_response
order by created desc limit 10;
-- Never select request headers, decrypted_secret or full queue rows for diagnostics.
