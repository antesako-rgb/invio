-- SAVE/REVIEW ONLY. Proposed definition; not installed. Use numbered install package, not definitions.
create index seating_templates_catalog_idx on public.seating_templates(sort_order,id) where is_active=true;
