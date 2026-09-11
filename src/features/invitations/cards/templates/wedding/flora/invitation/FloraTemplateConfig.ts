import type {
  EventExperienceTemplateConfig,
} from "@/features/invitations/types/eventExperienceTemplateConfig.types";

/* ==========================================================================
   Flora Template Config
========================================================================== */

export const floraTemplateConfig:
  EventExperienceTemplateConfig = {
    
    family:
      "flora",

    category:
      "wedding",

    preview: {
      cardUrl:
        "/invitation-assets/previews/flora/champagne.webp",

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
          "/invitation-assets/previews/flora/frame.png",
      },

      {
        id:
          "sage",

        previewUrl:
          "/invitation-assets/previews/flora/sage.webp",
      },

      {
        id:
          "dusty-rose",

        previewUrl:
          "/invitation-assets/previews/flora/rose.webp",
      },
    ],
  };