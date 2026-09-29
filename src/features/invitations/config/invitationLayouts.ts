/* ==========================================================================
   Invitation Layouts
========================================================================== */

export const invitationLayouts = {
  "date-card": {
    photoSlotCount: 0,
  },
  "photo-strip": {
    photoSlotCount: 3,
  },
  "portrait-cover": {
    photoSlotCount: 1,
  },
  "torn-paper": {
    photoSlotCount: 1,
  },
  poster: {
    photoSlotCount: 1,
  },
ornamental: {
    photoSlotCount: 0,
  },

  "full-photo": {
    photoSlotCount: 1,
  },

editorial: {
    photoSlotCount: 1,
  },

  timeline: {
    photoSlotCount: 0,
  },

  "photo-text": {
    photoSlotCount: 1,
  },

  split: {
    photoSlotCount: 1,
  },

  "photo-left": {
    photoSlotCount: 1,
  },

  grid: {
    photoSlotCount: 4,
  },
} as const;


/* ==========================================================================
   Types
========================================================================== */

export type InvitationLayout =
  keyof typeof invitationLayouts;


/* ==========================================================================
   Helpers
========================================================================== */

export function isInvitationLayout(
  value: string
): value is InvitationLayout {
  return Object.hasOwn(
    invitationLayouts,
    value
  );
}

export function getInvitationLayout(
  layout: InvitationLayout
) {
  return invitationLayouts[
    layout
  ];
}
