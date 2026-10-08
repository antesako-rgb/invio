-- SAVE/REVIEW ONLY. Proposed definition; not installed. Use numbered install package, not definitions.
create trigger seating_template_guard before insert or update on public.seating_templates for each row execute function private.seating_template_guard();
