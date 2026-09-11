import type {
  EventType,
} from "@/features/events/types/event.types";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";

import type {
  EventExperienceContent,
} from "@/features/invitations/types/eventExperienceContent.types";

import {
  weddingInvitationPreviewContent,
  weddingPhotoWallPreviewContent,
  weddingSaveTheDatePreviewContent,
  weddingThankYouPreviewContent,
} from "@/features/invitations/preview/data/weddingPreviewContent";


/* ==========================================================================
   Event Experience Preview Content Registry
========================================================================== */

export const eventExperiencePreviewContentRegistry:
  Partial<
    Record<
      EventType,
      Partial<
        Record<
          EventExperienceType,
          EventExperienceContent
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

      "photo-wall":
        weddingPhotoWallPreviewContent,
    },
  };