CREATE TRIGGER seating_template_guard BEFORE INSERT OR UPDATE ON public.seating_templates FOR EACH ROW EXECUTE FUNCTION private.seating_template_guard();
