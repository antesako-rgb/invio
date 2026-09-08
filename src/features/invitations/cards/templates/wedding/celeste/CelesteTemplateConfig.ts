import type {
  InvitationTemplateConfig,
} from "@/features/invitations/types/invitationTemplateConfig.types";


/* ==========================================================================
   Celeste Template Config
========================================================================== */

export const celesteTemplateConfig:
  InvitationTemplateConfig = {
    category:
      "wedding",

    preview: {
      cardUrl:
        "/invitation-assets/previews/celeste/classic.webp",

      imageUrl:
        "/invitation-assets/previews/celeste/couple.webp",
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