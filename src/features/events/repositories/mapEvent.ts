import type {
  Tables,
} from "@/lib/supabase/database.types";

import {
  isEventType,
  type Event,
} from "../types/event.types";


/* ==========================================================================
   Event Columns
========================================================================== */

export const EVENT_COLUMNS =
  "id,owner_id,name,type,custom_type,start_date,start_time,location_name,location_address,created_at,updated_at";


/* ==========================================================================
   Map Event
========================================================================== */

export function mapEvent(
  row: Pick<
    Tables<"events">,
    keyof Event
  >
): Event {
  if (!isEventType(row.type)) {
    throw new Error(
      `Unsupported event type: ${row.type}`
    );
  }

  return {
    id: row.id,
    owner_id: row.owner_id,
    name: row.name,
    type: row.type,

    custom_type:
      row.type === "other"
        ? row.custom_type
        : null,

    start_date: row.start_date,
    start_time: row.start_time,
    location_name: row.location_name,
    location_address: row.location_address,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}