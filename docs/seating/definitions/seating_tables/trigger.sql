-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create trigger seating_table_seat_guard before update of capacity,shape
 on public.seating_tables for each row execute function private.seating_table_seat_guard();
