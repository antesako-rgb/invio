-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create trigger seating_assignment_seat_guard before insert or update
 on public.seating_assignments for each row execute function private.seating_assignment_seat_guard();
