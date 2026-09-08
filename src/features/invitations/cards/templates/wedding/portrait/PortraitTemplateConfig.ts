import type {
  InvitationTemplateConfig,
} from "@/features/invitations/types/invitationTemplateConfig.types";


/* ==========================================================================
   Portrait Template Config
========================================================================== */

export const portraitTemplateConfig:
  InvitationTemplateConfig = {
    category:
      "wedding",

    preview: {
      cardUrl:
        "/invitation-assets/previews/portrait/classic.webp",

      imageUrl:
        "/invitation-assets/previews/portrait/couple.webp",
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