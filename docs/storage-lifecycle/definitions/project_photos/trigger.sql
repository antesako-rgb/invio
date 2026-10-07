-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/activation/018_ACTIVATE.sql
create trigger storage_photo_guard before insert or update or delete on public.project_photos
for each row execute function private.storage_photo_guard();
