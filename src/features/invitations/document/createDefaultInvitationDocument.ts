import type {
  InvitationDocument,
} from "../types/invitationDocument.types";


/* ==========================================================================
   Create Default Invitation Document
========================================================================== */

export function createDefaultInvitationDocument():
  InvitationDocument {
  return {
    eventDate: null,
    eventTime: null,
    theme:
      "classic",

    pages:
      [],
  };
}
