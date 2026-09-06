import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/database.types";


/* ==========================================================================
   Guest Group
========================================================================== */

export type GuestGroup =
  Tables<"guest_groups">;

export type CreateGuestGroupInput =
  TablesInsert<"guest_groups">;

export type UpdateGuestGroupInput =
  TablesUpdate<"guest_groups">;


/* ==========================================================================
   Guest RSVP Status
========================================================================== */

export const GUEST_RSVP_STATUSES = [
  "unknown",
  "attending",
  "declined",
] as const;

export type GuestRsvpStatus =
  typeof GUEST_RSVP_STATUSES[number];


/* ==========================================================================
   Guest RSVP Status Source
========================================================================== */

export const GUEST_RSVP_STATUS_SOURCES = [
  "automatic",
  "manual",
] as const;

export type GuestRsvpStatusSource =
  typeof GUEST_RSVP_STATUS_SOURCES[number];


/* ==========================================================================
   Event Guest
========================================================================== */

export type EventGuest =
  Tables<"event_guests">;

export type CreateEventGuestInput =
  TablesInsert<"event_guests">;

export type UpdateEventGuestInput =
  TablesUpdate<"event_guests">;


/* ==========================================================================
   Event Guest With RSVP
========================================================================== */

type EventGuestWithRsvpRow =
  Database["public"]["Functions"]["get_event_guests_with_rsvp"]["Returns"][number];

export type EventGuestWithRsvp =
  Omit<
    EventGuestWithRsvpRow,
    | "rsvp_status"
    | "rsvp_status_source"
    | "primary_rsvp_status"
  > & {
    rsvp_status:
      GuestRsvpStatus;

    rsvp_status_source:
      GuestRsvpStatusSource;

    primary_rsvp_status:
      GuestRsvpStatus | null;
  };


/* ==========================================================================
   Guest RSVP Invitation
========================================================================== */

export type GuestRsvpInvitation =
  Pick<
    Tables<"invitations">,
    | "id"
    | "name"
    | "is_primary_rsvp"
  >;


/* ==========================================================================
   Guest Filters
========================================================================== */

export type GuestGroupFilter =
  | "all"
  | "ungrouped"
  | string;