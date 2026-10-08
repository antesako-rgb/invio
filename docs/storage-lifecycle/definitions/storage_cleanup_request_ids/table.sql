-- PLANNED DEFINITION / SAVE ONLY. SQL021 NOT APPLIED; do not execute separately.
create table private.storage_cleanup_request_ids (
 request_id uuid primary key,
 issued_at bigint not null,
 consumed_at timestamptz not null default clock_timestamp()
);
