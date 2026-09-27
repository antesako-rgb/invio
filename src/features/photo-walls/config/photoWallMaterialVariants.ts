/* ==========================================================================
   Photo Wall Material Variants
========================================================================== */

export const photoWallMaterialVariants = {
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
   Photo Wall Material Variant Id
========================================================================== */

export type PhotoWallMaterialVariantId =
  keyof typeof photoWallMaterialVariants;