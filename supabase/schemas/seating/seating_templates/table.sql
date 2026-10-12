CREATE TABLE public.seating_templates (
 id uuid DEFAULT gen_random_uuid() NOT NULL,
 name text NOT NULL,
 slug text NOT NULL,
 description text,
 document jsonb NOT NULL,
 document_version integer DEFAULT 2 NOT NULL,
 is_active boolean DEFAULT false NOT NULL,
 sort_order integer DEFAULT 0 NOT NULL,
 event_type text,
 created_at timestamp with time zone DEFAULT now() NOT NULL,
 updated_at timestamp with time zone DEFAULT now() NOT NULL,
 CONSTRAINT seating_templates_description_check CHECK (((description IS NULL) OR (char_length(description) <= 2000))),
 CONSTRAINT seating_templates_document_check CHECK ((jsonb_typeof(document) = 'object'::text)),
 CONSTRAINT seating_templates_event_type_check CHECK (((event_type IS NULL) OR (event_type = ANY (ARRAY['wedding'::text, 'birthday'::text, 'baptism'::text, 'communion'::text, 'confirmation'::text, 'business'::text, 'other'::text])))),
 CONSTRAINT seating_templates_name_check CHECK (((char_length(TRIM(BOTH FROM name)) >= 1) AND (char_length(TRIM(BOTH FROM name)) <= 150))),
 CONSTRAINT seating_templates_pkey PRIMARY KEY (id),
 CONSTRAINT seating_templates_slug_check CHECK (((slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text) AND (char_length(slug) <= 150))),
 CONSTRAINT seating_templates_slug_key UNIQUE (slug),
 CONSTRAINT seating_templates_sort_order_check CHECK ((sort_order >= 0)),
 CONSTRAINT seating_templates_version_check CHECK (document_version = 2)
);
ALTER TABLE public.seating_templates OWNER TO postgres;
