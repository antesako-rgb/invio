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

        label:
          "Champagne",

        previewUrl:
          "/invitation-assets/previews/portrait/champagne.webp",

        swatch:
          "#d8c5a3",
      },

      {
        id:
          "sage",

        label:
          "Sage",

        previewUrl:
          "/invitation-assets/previews/portrait/sage.webp",

        swatch:
          "#66705f",
      },

      {
        id:
          "dusty-rose",

        label:
          "Dusty Rose",

        previewUrl:
          "/invitation-assets/previews/portrait/dusty-rose.webp",

        swatch:
          "#806762",
      },
    ],
  };