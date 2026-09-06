import type {
  InvitationRenderGuest,
} from "@/features/invitations/types/invitationRenderer.types";


/* ==========================================================================
   Invitation Editor Preview Guests
========================================================================== */

export const INVITATION_EDITOR_PREVIEW_GUESTS:
  InvitationRenderGuest[] = [
    {
      id:
        "preview-primary",

      firstName:
        "Ivan",

      lastName:
        "Horvat",

      isPrimaryRecipient:
        true,

      rsvp:
        null,
    },

    {
      id:
        "preview-companion",

      firstName:
        "Ana",

      lastName:
        "Horvat",

      isPrimaryRecipient:
        false,

      rsvp:
        null,
    },
  ];