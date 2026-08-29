import type {
  CreateEventGuestInput,
  UpdateEventGuestInput,
} from "../types/guest.types";

import type {
  GuestFormValues,
} from "../validation/guest.schema";


/* ==========================================================================
   Helpers
========================================================================== */

function toNullableString(
  value: string
): string | null {
  const trimmed =
    value.trim();

  return trimmed || null;
}


/* ==========================================================================
   Create Event Guest Input
========================================================================== */

export function buildCreateEventGuestInput(
  eventId: string,
  values: GuestFormValues
): CreateEventGuestInput {
  return {
    event_id:
      eventId,

    first_name:
      values.first_name.trim(),

    last_name:
      toNullableString(
        values.last_name
      ),

    email:
      toNullableString(
        values.email
      ),

    phone:
      toNullableString(
        values.phone
      ),

    group_id:
      values.group_id,

    notes:
      toNullableString(
        values.notes
      ),
  };
}


/* ==========================================================================
   Update Event Guest Input
========================================================================== */

export function buildUpdateEventGuestInput(
  values: GuestFormValues
): UpdateEventGuestInput {
  return {
    first_name:
      values.first_name.trim(),

    last_name:
      toNullableString(
        values.last_name
      ),

    email:
      toNullableString(
        values.email
      ),

    phone:
      toNullableString(
        values.phone
      ),

    group_id:
      values.group_id,

    notes:
      toNullableString(
        values.notes
      ),
  };
}