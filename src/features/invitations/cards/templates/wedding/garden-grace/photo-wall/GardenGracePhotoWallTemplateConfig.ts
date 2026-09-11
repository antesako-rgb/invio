import type {
  EventExperienceTemplateConfig,
} from "@/features/invitations/types/eventExperienceTemplateConfig.types";


/* ==========================================================================
   Garden Grace Photo Wall Template Config
========================================================================== */

export const gardenGracePhotoWallTemplateConfig:
  EventExperienceTemplateConfig = {

    family:
      "garden-grace",

    category:
      "wedding",

    preview: {
      cardUrl:
        "/invitation-assets/previews/garden-grace/photo-wall/champagne.webp",

      imageUrl:
        null,
    },

    card: {
      aspectRatio:
        "5 / 6",
    },

    features: {
      details:
        false,

      rsvp:
        false,

      photos:
        true,
    },

    envelopeId:
      null,

    defaultVariantId:
      "champagne",

    variants: [
      {
        id:
          "champagne",

        previewUrl:
          "/invitation-assets/previews/garden-grace/photo-wall/champagne.webp",
      },

      {
        id:
          "sage",

        previewUrl:
          "/invitation-assets/previews/garden-grace/photo-wall/sage.webp",
      },

      {
        id:
          "dusty-rose",

        previewUrl:
          "/invitation-assets/previews/garden-grace/photo-wall/dusty-rose.webp",
      },
    ],
  };