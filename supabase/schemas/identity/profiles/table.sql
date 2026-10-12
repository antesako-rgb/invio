-- CANONICAL EXPECTED STATE. Read-only DEV catalog reviewed 2026-10-12.
-- Definition for future reconstruction; NOT a migration to run on existing DEV.
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  first_name text,
  last_name text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT profiles_email_check CHECK (((char_length(email) > 0) AND (email = lower(TRIM(BOTH FROM email))))),
  CONSTRAINT profiles_email_key UNIQUE (email),
  CONSTRAINT profiles_first_name_check CHECK (((first_name IS NULL) OR ((char_length(TRIM(BOTH FROM first_name)) >= 1) AND (char_length(TRIM(BOTH FROM first_name)) <= 100)))),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profiles_last_name_check CHECK (((last_name IS NULL) OR ((char_length(TRIM(BOTH FROM last_name)) >= 1) AND (char_length(TRIM(BOTH FROM last_name)) <= 100)))),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);
ALTER TABLE public.profiles OWNER TO postgres;
