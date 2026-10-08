-- HISTORICAL, operator applied. DO NOT EXECUTE AGAIN.
-- REVIEW ONLY; signed design replaces the uninstalled bearer proposal.
-- Requires reviewed SQL021 and exactly one Vault secret named memora_storage_cleanup_secret.
-- No secret value belongs in this SQL. Do not activate automatically.
begin;
do $$ declare job_id bigint;
begin
 if exists(select 1 from cron.job where jobname='memora-storage-cleanup') then
  raise exception 'Existing job: inspect and pause manually before replacement';
 end if;
 if to_regprocedure('private.enqueue_signed_storage_cleanup()') is null then
  raise exception 'Apply SQL021 first';
 end if;
 if (select count(*) from vault.secrets where name='memora_storage_cleanup_secret')<>1 then
  raise exception 'Exactly one named Vault secret required';
 end if;
 job_id := cron.schedule('memora-storage-cleanup','*/5 * * * *',
 'select private.enqueue_signed_storage_cleanup();');
 perform cron.alter_job(job_id,active:=false);
end $$;
commit;
