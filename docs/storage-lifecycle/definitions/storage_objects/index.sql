-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/private.storage_objects/001_table.sql
create index storage_objects_sweep on private.storage_objects(state, expires_at);
