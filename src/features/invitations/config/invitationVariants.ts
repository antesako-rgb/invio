/* ==========================================================================
   Invitation Variants
========================================================================== */

export const invitationVariants = {
  champagne: {
    label:
      "Champagne",

    swatch:
      "#d8c5a3",
  },

  sage: {
    label:
      "Sage",

    swatch:
      "#66705f",
  },

  "dusty-rose": {
    label:
      "Dusty Rose",

    swatch:
      "#806762",
  },
} as const;


/* ==========================================================================
   Invitation Variant Id
========================================================================== */

export type InvitationVariantId =
  keyof typeof invitationVariants;