/* ==========================================================================
   Types
========================================================================== */

export type EventNavigationId =
  | "overview"
  | "guests"
  | "studio"
  | "seating";


export interface EventNavigationItem {
  id:
    EventNavigationId;

  path:
    string | null;

  exact?:
    boolean;
}


/* ==========================================================================
   Event Navigation
========================================================================== */

export const eventNavigation: EventNavigationItem[] = [
  {
    id:
      "overview",

    path:
      null,

    exact:
      true,
  },

  {
    id:
      "guests",

    path:
      "gosti",
  },

  {
    id:
      "studio",

    path:
      "studio",
  },

  {
    id:
      "seating",

    path:
      "stolovi",
  },
];