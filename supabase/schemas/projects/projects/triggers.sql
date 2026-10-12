-- CANONICAL EXPECTED STATE. Read-only DEV catalog reviewed 2026-10-12.
-- Definition for future reconstruction; NOT a migration to run on existing DEV.
-- BLOCKED until private.storage_project_deleted() and its Storage dependencies exist.
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION private.update_timestamp();
CREATE TRIGGER storage_project_deleted AFTER DELETE ON public.projects FOR EACH ROW EXECUTE FUNCTION private.storage_project_deleted();
