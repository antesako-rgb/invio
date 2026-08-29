import {
  formatDateAsLocalDate,
  parseLocalDate,
} from "@/lib/utils/date";

import type {
  CreateEventInput,
  Event,
  EventType,
  UpdateEventInput,
} from "../types/event.types";

import type {
  EventFormValues,
} from "../validation/event.schema";


/* ==========================================================================
   Helpers
========================================================================== */

function toOptionalString(
  value: string | null
) {
  if (value === null) {
    return undefined;
  }

  const trimmed =
    value.trim();

  return trimmed || undefined;
}


/* ==========================================================================
   Event Default Values
========================================================================== */

export function getEventDefaultValues():
  EventFormValues {
  return {
    name: "",

    type:
      "wedding",

    custom_type: "",

    start_date:
      new Date(),

    end_date:
      null,

    start_time: "",

    end_time: "",

    timezone:
      "Europe/Zagreb",

    location_name: "",

    location_address: "",

    planned_guests:
      null,

    planned_budget:
      null,

    currency_code:
      "EUR",
  };
}


/* ==========================================================================
   Event Form Values
========================================================================== */

export function getEventFormValues(
  event: Event
): EventFormValues {
  return {
    name:
      event.name,

    type:
      event.type as EventType,

    custom_type:
      event.custom_type ?? "",

    start_date:
      parseLocalDate(
        event.start_date
      ),

    end_date:
      event.end_date
        ? parseLocalDate(
            event.end_date
          )
        : null,

    start_time:
      event.start_time ?? "",

    end_time:
      event.end_time ?? "",

    timezone:
      event.timezone,

    location_name:
      event.location_name ?? "",

    location_address:
      event.location_address ?? "",

    planned_guests:
      event.planned_guests,

    planned_budget:
      event.planned_budget,

    currency_code:
      event.currency_code,
  };
}


/* ==========================================================================
   Create Event Payload
========================================================================== */

export function buildCreateEventPayload(
  values: EventFormValues
): CreateEventInput {
  return {
    p_name:
      values.name.trim(),

    p_type:
      values.type,

    p_custom_type:
      toOptionalString(
        values.custom_type
      ),

    p_start_date:
      formatDateAsLocalDate(
        values.start_date
      ),

    p_end_date:
      values.end_date
        ? formatDateAsLocalDate(
            values.end_date
          )
        : undefined,

    p_start_time:
      toOptionalString(
        values.start_time
      ),

    p_end_time:
      toOptionalString(
        values.end_time
      ),

    p_timezone:
      values.timezone.trim(),

    p_location_name:
      toOptionalString(
        values.location_name
      ),

    p_location_address:
      toOptionalString(
        values.location_address
      ),

    p_planned_guests:
      values.planned_guests ??
      undefined,

    p_planned_budget:
      values.planned_budget ??
      undefined,

    p_currency_code:
      values.currency_code.trim(),
  };
}


/* ==========================================================================
   Update Event Payload
========================================================================== */

export function buildUpdateEventPayload(
  eventId: string,
  values: EventFormValues
): UpdateEventInput {
  return {
    p_event_id:
      eventId,

    p_name:
      values.name.trim(),

    p_type:
      values.type,

    p_custom_type:
      toOptionalString(
        values.custom_type
      ),

    p_start_date:
      formatDateAsLocalDate(
        values.start_date
      ),

    p_end_date:
      values.end_date
        ? formatDateAsLocalDate(
            values.end_date
          )
        : undefined,

    p_start_time:
      toOptionalString(
        values.start_time
      ),

    p_end_time:
      toOptionalString(
        values.end_time
      ),

    p_timezone:
      values.timezone.trim(),

    p_location_name:
      toOptionalString(
        values.location_name
      ),

    p_location_address:
      toOptionalString(
        values.location_address
      ),

    p_planned_guests:
      values.planned_guests ??
      undefined,

    p_planned_budget:
      values.planned_budget ??
      undefined,

    p_currency_code:
      values.currency_code.trim(),
  };
}