import type {
  InvitationTemplateConfig,
} from "@/features/invitations/types/invitationTemplateConfig.types";


/* ==========================================================================
   Garden Grace Template Config
========================================================================== */

export const gardenGraceTemplateConfig:
  InvitationTemplateConfig = {
    type:
      "invitation",

    family:
      "garden-grace",

    category:
      "wedding",

    preview: {
      cardUrl:
        "/invitation-assets/previews/garden-grace/classic.webp",

      imageUrl:
        "/invitation-assets/previews/garden-grace/couple.webp",
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