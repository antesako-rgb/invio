CREATE INDEX seating_elements_plan_order_idx ON public.seating_elements USING btree (plan_id, z_index, id);
CREATE INDEX seating_elements_project_idx ON public.seating_elements USING btree (project_id);
