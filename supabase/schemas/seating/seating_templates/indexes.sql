CREATE INDEX seating_templates_catalog_idx ON public.seating_templates USING btree (sort_order, id) WHERE (is_active = true);
