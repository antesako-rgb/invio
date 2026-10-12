CREATE TABLE public.seating_elements (
 id uuid DEFAULT gen_random_uuid() NOT NULL,
 project_id uuid NOT NULL,
 plan_id uuid NOT NULL,
 kind text NOT NULL,
 name text NOT NULL,
 x_cm integer NOT NULL,
 y_cm integer NOT NULL,
 width_cm integer NOT NULL,
 height_cm integer NOT NULL,
 rotation_deg integer DEFAULT 0 NOT NULL,
 z_index integer DEFAULT 0 NOT NULL,
 locked boolean DEFAULT false NOT NULL,
 appearance jsonb DEFAULT '{}'::jsonb NOT NULL,
 CONSTRAINT seating_elements_dimensions_check CHECK ((((kind = 'dance_floor'::text) AND ((width_cm >= 200) AND (width_cm <= 2000)) AND ((height_cm >= 200) AND (height_cm <= 2000))) OR ((kind = 'stage'::text) AND ((width_cm >= 200) AND (width_cm <= 2000)) AND ((height_cm >= 120) AND (height_cm <= 1200))) OR ((kind = 'dj_booth'::text) AND ((width_cm >= 120) AND (width_cm <= 500)) AND ((height_cm >= 60) AND (height_cm <= 300))))),
 CONSTRAINT seating_elements_name_check CHECK (((char_length(TRIM(BOTH FROM name)) >= 1) AND (char_length(TRIM(BOTH FROM name)) <= 150))),
 CONSTRAINT seating_elements_order_check CHECK (((z_index >= 0) AND (z_index <= 10000))),
 CONSTRAINT seating_elements_pk PRIMARY KEY (id),
 CONSTRAINT seating_elements_plan_fk FOREIGN KEY (project_id, plan_id) REFERENCES seating_plans(project_id, id) ON DELETE CASCADE,
 CONSTRAINT seating_elements_position_check CHECK ((((x_cm >= 0) AND (x_cm <= 100000)) AND ((y_cm >= 0) AND (y_cm <= 100000)))),
 CONSTRAINT seating_elements_rotation_check CHECK (((rotation_deg >= 0) AND (rotation_deg <= 359))),
 CONSTRAINT seating_elements_appearance_check CHECK (private.seating_appearance_valid(kind, appearance))
);
ALTER TABLE public.seating_elements OWNER TO postgres;
