import type {
  InvitationTemplateConfig,
} from "@/features/invitations/types/invitationTemplateConfig.types";


/* ==========================================================================
   Garden Grace Save The Date Template Config
========================================================================== */

export const gardenGraceSaveTheDateTemplateConfig:
  InvitationTemplateConfig = {
    type:
      "save-the-date",

    family:
      "garden-grace",

    category:
      "wedding",

    preview: {
      cardUrl:
        "/invitation-assets/previews/garden-grace/save-the-date/classic.webp",

      imageUrl:
        null,
    },

    card: {
      aspectRatio:
        "1 / 1",
    },

    features: {
      details:
        false,

      rsvp:
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
          "/invitation-assets/previews/garden-grace/save-the-date/champagne.webp",
      },

      {
        id:
          "sage",

        previewUrl:
          "/invitation-assets/previews/garden-grace/save-the-date/sage.webp",
      },

      {
        id:
          "dusty-rose",

        previewUrl:
          "/invitation-assets/previews/garden-grace/save-the-date/dusty-rose.webp",
      },
    ],
  };