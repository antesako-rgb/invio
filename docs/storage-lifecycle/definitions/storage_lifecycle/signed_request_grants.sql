-- SAVE / REVIEW ONLY. SQL021 APPLIED by operator; do not execute separately.
revoke all on function public.storage_consume_cleanup_request(uuid,bigint) from public,anon,authenticated;

grant execute on function public.storage_consume_cleanup_request(uuid,bigint) to service_role;

revoke all on function private.enqueue_signed_storage_cleanup() from public,anon,authenticated,service_role;
