import {
  floraPreviewContent,
} from "@/features/invitations/preview/data/floraPreviewContent";

import {
  portraitPreviewContent,
} from "@/features/invitations/preview/data/portraitPreviewContent";

import type {
  InvitationTemplateConfig,
} from "@/features/invitations/types/invitationTemplateConfig.types";


/* ==========================================================================
   Invitation Template Registry
========================================================================== */

export const invitationTemplateRegistry:
  Record<string, InvitationTemplateConfig> = {
    flora: {
      category:
        "wedding",

      previewUrl:
        "/invitation-assets/previews/flora/champagne.webp",

      previewContent:
        floraPreviewContent,

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
            "/invitation-assets/previews/flora/champagne.webp",

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
    },


    /* ======================================================================
       Portrait
    ====================================================================== */

    portrait: {
      category:
        "wedding",

      previewUrl:
        "/invitation-assets/previews/portrait/classic.webp",

      previewContent:
        portraitPreviewContent,

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
            "/invitation-assets/previews/flora/champagne.webp",

          swatch:
            "#d8c5a3",
        },
      ],
    },
  };