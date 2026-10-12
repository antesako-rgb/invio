-- CANONICAL EXPECTED STATE. Read-only DEV catalog reviewed 2026-10-12.
-- Definition for future reconstruction; NOT a migration to run on existing DEV.
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  owner_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  type text NOT NULL,
  custom_type text,
  start_date date NOT NULL,
  start_time time without time zone,
  location_name text,
  location_address text,
  CONSTRAINT projects_custom_type_check CHECK ((((type = 'other'::text) AND (custom_type IS NOT NULL) AND ((char_length(TRIM(BOTH FROM custom_type)) >= 1) AND (char_length(TRIM(BOTH FROM custom_type)) <= 100))) OR ((type <> 'other'::text) AND (custom_type IS NULL)))),
  CONSTRAINT projects_location_address_check CHECK (((location_address IS NULL) OR ((char_length(TRIM(BOTH FROM location_address)) >= 1) AND (char_length(TRIM(BOTH FROM location_address)) <= 250)))),
  CONSTRAINT projects_location_name_check CHECK (((location_name IS NULL) OR ((char_length(TRIM(BOTH FROM location_name)) >= 1) AND (char_length(TRIM(BOTH FROM location_name)) <= 150)))),
  CONSTRAINT projects_name_length_check CHECK (((char_length(TRIM(BOTH FROM name)) >= 1) AND (char_length(TRIM(BOTH FROM name)) <= 150))),
  CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_type_check CHECK ((type = ANY (ARRAY['wedding'::text, 'birthday'::text, 'baptism'::text, 'communion'::text, 'confirmation'::text, 'business'::text, 'other'::text])))
);
ALTER TABLE public.projects OWNER TO postgres;
