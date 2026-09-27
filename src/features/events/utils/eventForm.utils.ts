import {
  formatDateAsLocalDate,
  parseLocalDate,
} from "@/lib/utils/date";

import type {
  CreateEventInput,
  Event,
  UpdateEventInput,
} from "../types/event.types";

import {
  eventSchema,
  type EventFormValues,
} from "../validation/event.schema";


/* ==========================================================================
   Default Values
========================================================================== */

export function getEventDefaultValues(): EventFormValues {
  return {
    name: "",
    type: "wedding",
    custom_type: "",
    start_date: new Date(),
    start_time: "",
    location_name: "",
    location_address: "",
  };
}


/* ==========================================================================
   Event → Form
========================================================================== */

export function getEventFormValues(
  event: Event
): EventFormValues {
  return {
    name: event.name,
    type: event.type,

    custom_type:
      event.type === "other"
        ? event.custom_type ?? ""
        : "",

    start_date:
      parseLocalDate(
        event.start_date
      ),

    start_time:
      event.start_time ?? "",

    location_name:
      event.location_name ?? "",

    location_address:
      event.location_address ?? "",
  };
}


/* ==========================================================================
   Form Field
========================================================================== */

export function setEventFormField<
  K extends keyof EventFormValues
>(
  current: EventFormValues,
  key: K,
  value: EventFormValues[K]
): EventFormValues {
  const next = {
    ...current,
    [key]: value,
  };

  if (next.type !== "other") {
    next.custom_type = "";
  }

  return next;
}


/* ==========================================================================
   Form → Create Payload
========================================================================== */

export function buildCreateEventPayload(
  input: EventFormValues
): CreateEventInput {
  const values =
    eventSchema.parse(input);

  return {
    p_name:
      values.name,

    p_type:
      values.type,

    p_start_date:
      formatDateAsLocalDate(
        values.start_date
      ),

    ...(values.type === "other" && {
      p_custom_type:
        values.custom_type,
    }),

    ...(values.start_time?.trim() && {
      p_start_time:
        values.start_time.trim(),
    }),

    ...(values.location_name && {
      p_location_name:
        values.location_name,
    }),

    ...(values.location_address && {
      p_location_address:
        values.location_address,
    }),
  };
}


/* ==========================================================================
   Form → Update Payload
========================================================================== */

export function buildUpdateEventPayload(
  eventId: string,
  input: EventFormValues
): UpdateEventInput {
  const values =
    eventSchema.parse(input);

  return {
    p_event_id:
      eventId,

    p_name:
      values.name,

    p_type:
      values.type,

    p_start_date:
      formatDateAsLocalDate(
        values.start_date
      ),

    p_custom_type:
      values.type === "other"
        ? values.custom_type
        : null,

    p_start_time:
      values.start_time?.trim() || null,

    p_location_name:
      values.location_name || null,

    p_location_address:
      values.location_address || null,
  };
}