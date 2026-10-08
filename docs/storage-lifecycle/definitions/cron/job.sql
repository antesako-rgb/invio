-- SAVE / REVIEW ONLY. Already installed and enabled by operator; DO NOT replay cron.schedule.
-- Name: memora-storage-cleanup
-- Schedule: */5 * * * *
-- Username: postgres
-- Active: true (operator-confirmed 2026-10-08)
-- Command: select private.enqueue_signed_storage_cleanup();
-- This SELECT only inspects the saved job; it does not enqueue HTTP or run cleanup.
select jobid,jobname,schedule,active,username,command
from cron.job where jobname='memora-storage-cleanup';
