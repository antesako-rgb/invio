import {
  GUEST_RSVP_STATUSES,
} from "@/features/guests/types/guest.types";

import type {
  CreateEventGuestInput,
  GuestRsvpStatus,
  UpdateEventGuestInput,
} from "@/features/guests/types/guest.types";

import type {
  GuestFormValues,
} from "@/features/guests/validation/guest.schema";


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
   Parse Guest RSVP Status
========================================================================== */

export function parseGuestRsvpStatus(
  value: string
): GuestRsvpStatus {
  const status =
    GUEST_RSVP_STATUSES.find(
      (status) =>
        status === value
    );

  return status ??
    "unknown";
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
      values.last_name.trim(),

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

    rsvp_status:
      values.rsvp_status,

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
      values.last_name.trim(),

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

    rsvp_status:
      values.rsvp_status,

    notes:
      toNullableString(
        values.notes
      ),
  };
}