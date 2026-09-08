import type {
  InvitationTemplateConfig,
} from "@/features/invitations/types/invitationTemplateConfig.types";


/* ==========================================================================
   Flora Template Config
========================================================================== */

export const floraTemplateConfig:
  InvitationTemplateConfig = {
    type:
      "invitation",

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