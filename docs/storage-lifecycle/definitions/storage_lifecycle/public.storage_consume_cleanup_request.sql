-- PLANNED DEFINITION / SAVE ONLY. SQL021 NOT APPLIED; do not execute separately.
create function public.storage_consume_cleanup_request(p_request_id uuid,p_timestamp bigint)
returns boolean language plpgsql security definer set search_path = '' as $$
declare inserted integer; current_epoch bigint;
begin
 current_epoch := floor(extract(epoch from clock_timestamp()))::bigint;
 if p_request_id is null or p_timestamp is null or p_timestamp>current_epoch+30
 or p_timestamp<current_epoch-120 then return false; end if;
 -- Retain ten minutes beyond the entire accepted window; expired signed requests
 -- remain invalid even once their nonce row is pruned.
 delete from private.storage_cleanup_request_ids where issued_at<current_epoch-600;
 insert into private.storage_cleanup_request_ids(request_id,issued_at)
 values(p_request_id,p_timestamp) on conflict do nothing;
 get diagnostics inserted = row_count;
 return inserted=1;
end;
$$;
