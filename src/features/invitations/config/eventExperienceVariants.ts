/* ==========================================================================
   Event Experience Variants
========================================================================== */

export const eventExperienceVariants = {
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
   Event Experience Variant Id
========================================================================== */

export type EventExperienceVariantId =
  keyof typeof eventExperienceVariants;