import type {
  Database,
  Tables,
} from "@/lib/supabase/database.types";


/* ==========================================================================
   Event
========================================================================== */

export type Event =
  Tables<"events">;


/* ==========================================================================
   Event Type
========================================================================== */

export type EventType =
  | "wedding"
  | "confirmation"
  | "baptism"
  | "communion"
  | "birthday"
  | "other_private"
  | "conference"
  | "seminar"
  | "team_building"
  | "reception"
  | "gala_dinner"
  | "other_business"
  | "festival"
  | "charity"
  | "sports"
  | "cultural"
  | "music"
  | "other_social";


/* ==========================================================================
   Event RPC Inputs
========================================================================== */

export type CreateEventInput =
  Database["public"]["Functions"]["create_event"]["Args"];

export type UpdateEventInput =
  Database["public"]["Functions"]["update_event"]["Args"];

export type DeleteEventInput =
  Database["public"]["Functions"]["delete_event"]["Args"];