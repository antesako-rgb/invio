-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.
-- Initial application: install/001-018 in README order, with atomic activation.

-- Source: install/activation/018_ACTIVATE.sql
create trigger storage_document_guard before insert or update of document, project_id on public.invitations
for each row execute function private.storage_document_guard();
