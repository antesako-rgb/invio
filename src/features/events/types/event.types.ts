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
   Event Types
========================================================================== */

export const EVENT_TYPES = [
  "wedding",
  "confirmation",
  "baptism",
  "communion",
  "birthday",
  "other_private",
  "conference",
  "seminar",
  "team_building",
  "reception",
  "gala_dinner",
  "other_business",
  "festival",
  "charity",
  "sports",
  "cultural",
  "music",
  "other_social",
] as const;


/* ==========================================================================
   Event Type
========================================================================== */

export type EventType =
  typeof EVENT_TYPES[number];


/* ==========================================================================
   Event Type Guard
========================================================================== */

export function isEventType(
  value:
    string
): value is EventType {
  return EVENT_TYPES.some(
    (eventType) =>
      eventType === value
  );
}


/* ==========================================================================
   Event RPC Inputs
========================================================================== */

export type CreateEventInput =
  Database["public"]["Functions"]["create_event"]["Args"];

export type UpdateEventInput =
  Database["public"]["Functions"]["update_event"]["Args"];

export type DeleteEventInput =
  Database["public"]["Functions"]["delete_event"]["Args"];