-- OPERATIONAL COMMANDS ONLY: save for emergencies; NEVER run the whole file.
-- Select ONE statement to intentionally change cron state. No job creation.
-- Pause future scheduling; already queued/in-flight requests are NOT cancelled:
select cron.alter_job(jobid,active:=false) from cron.job where jobname='memora-storage-cleanup';
-- Resume only after review/authorization:
select cron.alter_job(jobid,active:=true) from cron.job where jobname='memora-storage-cleanup';
-- Vercel STORAGE_CLEANUP_ENABLED=false plus redeploy disables new endpoint processing.
-- Do not execute rollback_freeze as routine maintenance; it also stops upload RPCs.
