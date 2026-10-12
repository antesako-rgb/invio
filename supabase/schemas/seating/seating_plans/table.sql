CREATE TABLE public.seating_plans (
 id uuid DEFAULT gen_random_uuid() NOT NULL,
 project_id uuid NOT NULL,
 name text NOT NULL,
 rsvp_invitation_id uuid,
 width_cm integer NOT NULL,
 height_cm integer NOT NULL,
 revision bigint DEFAULT 1 NOT NULL,
 created_at timestamp with time zone DEFAULT now() NOT NULL,
 updated_at timestamp with time zone DEFAULT now() NOT NULL,
 appearance jsonb DEFAULT '{}'::jsonb NOT NULL,
 CONSTRAINT seating_plans_c1 PRIMARY KEY (id),
 CONSTRAINT seating_plans_c2 FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
 CONSTRAINT seating_plans_c3 CHECK (((char_length(TRIM(BOTH FROM name)) >= 1) AND (char_length(TRIM(BOTH FROM name)) <= 150))),
 CONSTRAINT seating_plans_c4 CHECK (((width_cm >= 100) AND (width_cm <= 100000))),
 CONSTRAINT seating_plans_c5 CHECK (((height_cm >= 100) AND (height_cm <= 100000))),
 CONSTRAINT seating_plans_c6 CHECK ((revision >= 1)),
 CONSTRAINT seating_plans_c7 UNIQUE (project_id, id),
 CONSTRAINT seating_plans_c8 FOREIGN KEY (project_id, rsvp_invitation_id) REFERENCES invitations(project_id, id) ON DELETE SET NULL (rsvp_invitation_id),
 CONSTRAINT seating_plans_appearance_check CHECK (private.seating_appearance_valid('room', appearance))
);
ALTER TABLE public.seating_plans OWNER TO postgres;
