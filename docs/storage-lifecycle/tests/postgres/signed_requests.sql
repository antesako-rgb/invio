-- ONLY isolated synthetic test DB AFTER SQL021. No enqueue/HTTP/Bunny call.
begin;
do $$ declare id uuid := gen_random_uuid(); stamp bigint := floor(extract(epoch from clock_timestamp()))::bigint;
begin
 if not public.storage_consume_cleanup_request(id,stamp) then raise exception 'First claim failed'; end if;
 if public.storage_consume_cleanup_request(id,stamp) then raise exception 'Replay accepted'; end if;
 if public.storage_consume_cleanup_request(gen_random_uuid(),stamp-121) then raise exception 'Expired accepted'; end if;
 if public.storage_consume_cleanup_request(gen_random_uuid(),stamp+31) then raise exception 'Future accepted'; end if;
end $$;
rollback;
-- Real concurrency: two independent sessions consuming SAME UUID/current stamp;
-- exactly one boolean true. Mock Promise.all test is not a PostgreSQL concurrency test.
