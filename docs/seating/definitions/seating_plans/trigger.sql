-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.

create trigger seating_plan_guard before update on public.seating_plans for each row execute function private.seating_plan_guard();
