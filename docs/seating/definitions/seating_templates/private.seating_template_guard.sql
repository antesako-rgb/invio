-- SAVE/REVIEW ONLY. Proposed definition; not installed. Use numbered install package, not definitions.
create or replace function private.seating_template_guard() returns trigger language plpgsql security definer set search_path='' as $template$
begin perform private.validate_seating_template(new.document,new.document_version);new.updated_at:=now();return new;end $template$;
