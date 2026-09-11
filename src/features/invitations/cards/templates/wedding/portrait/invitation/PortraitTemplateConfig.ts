import type {
  EventExperienceTemplateConfig,
} from "@/features/invitations/types/eventExperienceTemplateConfig.types";


/* ==========================================================================
   Portrait Template Config
========================================================================== */

export const portraitTemplateConfig:
  EventExperienceTemplateConfig = {

    family:
      "portrait",

    category:
      "wedding",

    preview: {
      cardUrl:
        "/invitation-assets/previews/portrait/classic.webp",

      imageUrl:
        "/invitation-assets/previews/portrait/couple.webp",
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
          "/invitation-assets/previews/portrait/champagne.webp",
      },

      {
        id:
          "sage",

        previewUrl:
          "/invitation-assets/previews/portrait/sage.webp",
      },

      {
        id:
          "dusty-rose",

        previewUrl:
          "/invitation-assets/previews/portrait/dusty-rose.webp",
      },
    ],
  };