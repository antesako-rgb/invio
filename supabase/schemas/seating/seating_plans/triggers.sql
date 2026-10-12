CREATE TRIGGER seating_plan_guard BEFORE UPDATE ON public.seating_plans FOR EACH ROW EXECUTE FUNCTION private.seating_plan_guard();
