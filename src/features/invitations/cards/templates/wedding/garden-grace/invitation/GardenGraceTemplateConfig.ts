import type {
  EventExperienceTemplateConfig,
} from "@/features/invitations/types/eventExperienceTemplateConfig.types";


/* ==========================================================================
   Garden Grace Template Config
========================================================================== */

export const gardenGraceTemplateConfig:
  EventExperienceTemplateConfig = {
    family:
      "garden-grace",

    category:
      "wedding",

    preview: {
      cardUrl:
        "/invitation-assets/previews/garden-grace/champagne.webp",

      imageUrl:
        null,
    },

    card: {
      aspectRatio:
        "5 / 7",
    },

    features: {
      details:
        true,

      rsvp:
        true,

      photos:
        false,
    },

    envelopeId:
      "classic",

    defaultVariantId:
      "champagne",

    variants: [
      {
        id:
          "champagne",

        previewUrl:
          "/invitation-assets/previews/garden-grace/champagne.webp",
      },

      {
        id:
          "sage",

        previewUrl:
          "/invitation-assets/previews/garden-grace/sage.webp",
      },

      {
        id:
          "dusty-rose",

        previewUrl:
          "/invitation-assets/previews/garden-grace/dusty-rose.webp",
      },
    ],
  };