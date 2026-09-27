import type {
  Tables,
} from "@/lib/supabase/database.types";


/* ==========================================================================
   Event Types
========================================================================== */

export const EVENT_TYPES = [
  "wedding",
  "birthday",
  "baptism",
  "communion",
  "confirmation",
  "business",
  "other",
] as const;

export type EventType =
  (typeof EVENT_TYPES)[number];

export function isEventType(
  value: string
): value is EventType {
  return EVENT_TYPES.some(
    (type) =>
      type === value
  );
}


/* ==========================================================================
   Event
========================================================================== */

export type Event =
  Pick<
    Tables<"events">,
    | "id"
    | "owner_id"
    | "name"
    | "custom_type"
    | "start_date"
    | "start_time"
    | "location_name"
    | "location_address"
    | "created_at"
    | "updated_at"
  > & {
    type: EventType;
  };


/* ==========================================================================
   Create Event Input
========================================================================== */

export interface CreateEventInput {
  p_name: string;
  p_type: EventType;
  p_start_date: string;

  p_custom_type?: string;
  p_start_time?: string;
  p_location_name?: string;
  p_location_address?: string;
}


/* ==========================================================================
   Update Event Input
========================================================================== */

export interface UpdateEventInput {
  p_event_id: string;

  p_name: string;
  p_type: EventType;
  p_start_date: string;

  p_custom_type: string | null;
  p_start_time: string | null;
  p_location_name: string | null;
  p_location_address: string | null;
}


/* ==========================================================================
   Delete Event Input
========================================================================== */

export interface DeleteEventInput {
  p_event_id: string;
}