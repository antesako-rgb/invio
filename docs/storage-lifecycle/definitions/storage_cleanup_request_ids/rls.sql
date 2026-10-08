-- SAVE / REVIEW ONLY. SQL021 APPLIED by operator; do not execute separately.
alter table private.storage_cleanup_request_ids enable row level security;

create policy deny_clients on private.storage_cleanup_request_ids as restrictive for all to public
 using (false) with check (false);
