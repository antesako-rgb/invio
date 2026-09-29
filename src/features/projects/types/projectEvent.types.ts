import type {
  Tables,
  Database,
} from "@/lib/supabase/database.types";


/* ==========================================================================
   ProjectEvent Types
========================================================================== */

export const PROJECT_EVENT_TYPES = [
  "wedding",
  "birthday",
  "baptism",
  "communion",
  "confirmation",
  "business",
  "other",
] as const;

export type ProjectEventType =
  (typeof PROJECT_EVENT_TYPES)[number];

export function isProjectEventType(
  value: string
): value is ProjectEventType {
  return PROJECT_EVENT_TYPES.some(
    (type) =>
      type === value
  );
}


/* ==========================================================================
   ProjectEvent
========================================================================== */

// Application view model for the existing ProjectEvent UI, composed from a Project
// and its required event details. This is not a database table row.
export type ProjectEvent = Tables<"projects"> & Pick<Tables<"project_event_details">,
  "custom_type" | "start_date" | "start_time" | "location_name" | "location_address"
> & { type: ProjectEventType };


/* ==========================================================================
   Create ProjectEvent Input
========================================================================== */

export type CreateProjectEventInput = Omit<
  Database["public"]["Functions"]["create_event_project"]["Args"], "p_type"
> & { p_type: ProjectEventType };


/* ==========================================================================
   Update ProjectEvent Input
========================================================================== */

export interface UpdateProjectEventInput {
  p_project_id: string;

  p_name: string;
  p_type: ProjectEventType;
  p_start_date: string;

  p_custom_type: string | null;
  p_start_time: string | null;
  p_location_name: string | null;
  p_location_address: string | null;
}
