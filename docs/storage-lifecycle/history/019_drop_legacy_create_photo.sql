-- REVIEW ONLY: optional maintenance AFTER install 001-018 and upload smoke tests.
-- NOT EXECUTED by Codex. Run manually as postgres, scheduler paused.
-- Deploy/review updated rollback_freeze.sql and verify first.
-- No CASCADE: catalog dependencies must fail the transaction.
-- Static source audit cannot detect external scripts or SQL Editor saved queries.
begin;
drop function public.create_invitation_photo(uuid,text,bigint,text);
drop function public.create_digital_album_photo(uuid,text,bigint,text);
commit;
-- A failure rolls back both DROPs. Do not use CASCADE to force completion.
-- After success: run checks/003_verify_read_only.sql; regenerate database types.
-- This removes no table/data. Do not replay historical install/definitions grants.
-- Operational rollback freezes NEW RPCs; it does not recreate these unsafe endpoints.
