-- REVIEW ONLY, NOT EXECUTED. Run manually as postgres only after review.
-- Vault already installed. No cron job is created by this file.
begin;
create extension if not exists pg_cron;
create extension if not exists pg_net;
commit;
-- Reinspect signatures/queue metadata before running 002; platform versions matter.
