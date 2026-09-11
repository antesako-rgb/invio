import type {
  EventExperienceTemplateConfig,
} from "@/features/invitations/types/eventExperienceTemplateConfig.types";

/* ==========================================================================
   Celeste Template Config
========================================================================== */

export const celesteTemplateConfig:
 EventExperienceTemplateConfig = {

    family:
      "celeste",

    category:
      "wedding",

    preview: {
      cardUrl:
        "/invitation-assets/previews/celeste/classic.webp",

      imageUrl:
        "/invitation-assets/previews/celeste/couple.webp",
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
          "/invitation-assets/previews/celeste/champagne.webp",
      },

      {
        id:
          "sage",

        previewUrl:
          "/invitation-assets/previews/celeste/sage.webp",
      },

      {
        id:
          "dusty-rose",

        previewUrl:
          "/invitation-assets/previews/celeste/dusty-rose.webp",
      },
    ],
  };