import type {
  InvitationTemplateConfig,
} from "@/features/invitations/types/invitationTemplateConfig.types";


/* ==========================================================================
   Flora Template Config
========================================================================== */

export const floraTemplateConfig:
  InvitationTemplateConfig = {
    category:
      "wedding",

    preview: {
      cardUrl:
        "/invitation-assets/previews/flora/champagne.webp",

      imageUrl:
        null,
    },

    envelopeId:
      "classic",

    defaultVariantId:
      "champagne",

    variants: [
      {
        id:
          "champagne",

        label:
          "Champagne",

        previewUrl:
          "/invitation-assets/previews/flora/frame.png",

        swatch:
          "#d8c5a3",
      },

      {
        id:
          "sage",

        label:
          "Sage",

        previewUrl:
          "/invitation-assets/previews/flora/sage.webp",

        swatch:
          "#87977a",
      },

      {
        id:
          "rose",

        label:
          "Rose",

        previewUrl:
          "/invitation-assets/previews/flora/rose.webp",

        swatch:
          "#c99a9f",
      },
    ],
  };