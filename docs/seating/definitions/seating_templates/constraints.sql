-- SAVE/REVIEW ONLY. Proposed definition; not installed. Use numbered install package, not definitions.
alter table public.seating_templates add constraint seating_templates_pkey primary key(id);
alter table public.seating_templates add constraint seating_templates_slug_key unique(slug);
alter table public.seating_templates add constraint seating_templates_name_check check(char_length(trim(name)) between 1 and 150);
alter table public.seating_templates add constraint seating_templates_slug_check check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug)<=150);
alter table public.seating_templates add constraint seating_templates_description_check check(description is null or char_length(description)<=2000);
alter table public.seating_templates add constraint seating_templates_version_check check(document_version=1);
alter table public.seating_templates add constraint seating_templates_document_check check(jsonb_typeof(document)='object');
alter table public.seating_templates add constraint seating_templates_sort_order_check check(sort_order>=0);
alter table public.seating_templates add constraint seating_templates_event_type_check check(event_type is null or event_type in ('wedding','birthday','baptism','communion','confirmation','business','other'));
