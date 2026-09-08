import type {
  EventType,
} from "@/features/events/types/event.types";

import type {
  InvitationContent,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationTemplateType,
} from "@/features/invitations/types/invitationTemplateConfig.types";

import {
  weddingInvitationPreviewContent,
  weddingSaveTheDatePreviewContent,
  weddingThankYouPreviewContent,
} from "./weddingPreviewContent";


/* ==========================================================================
   Invitation Preview Content Registry
========================================================================== */

export const invitationPreviewContentRegistry:
  Partial<
    Record<
      EventType,
      Partial<
        Record<
          InvitationTemplateType,
          InvitationContent
        >
      >
    >
  > = {
    wedding: {
      invitation:
        weddingInvitationPreviewContent,

      "save-the-date":
        weddingSaveTheDatePreviewContent,

      "thank-you":
        weddingThankYouPreviewContent,
    },
  };