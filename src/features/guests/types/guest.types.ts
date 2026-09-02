import type {
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
   Event Guest
========================================================================== */

export type EventGuest =
  Tables<"event_guests">;

export type CreateEventGuestInput =
  TablesInsert<"event_guests">;

export type UpdateEventGuestInput =
  TablesUpdate<"event_guests">;


/* ==========================================================================
   Guest Filters
========================================================================== */

export type GuestGroupFilter =
  | "all"
  | "ungrouped"
  | string;