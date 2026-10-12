CREATE TRIGGER seating_table_seat_guard BEFORE UPDATE OF capacity, shape ON public.seating_tables FOR EACH ROW EXECUTE FUNCTION private.seating_table_seat_guard();
