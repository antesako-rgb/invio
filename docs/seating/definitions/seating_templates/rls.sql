-- SAVE/REVIEW ONLY. Proposed definition; not installed. Use numbered install package, not definitions.
alter table public.seating_templates enable row level security;
create policy seating_templates_select on public.seating_templates for select to authenticated using(is_active=true);
