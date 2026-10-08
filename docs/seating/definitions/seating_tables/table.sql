-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
create table public.seating_tables (
 id uuid not null default gen_random_uuid(),
 project_id uuid not null,
 plan_id uuid not null,
 name text not null,
 shape text not null,
 capacity integer not null,
 x_cm integer not null,
 y_cm integer not null,
 width_cm integer not null,
 height_cm integer not null,
 rotation_deg integer not null default 0
);
