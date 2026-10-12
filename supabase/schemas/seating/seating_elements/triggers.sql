CREATE TRIGGER seating_element_guard BEFORE INSERT OR UPDATE ON public.seating_elements FOR EACH ROW EXECUTE FUNCTION private.seating_element_guard();
