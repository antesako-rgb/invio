import type {
  InvitationDocument,
} from "../types/invitationDocument.types";


/* ==========================================================================
   Create Default Invitation Document
========================================================================== */

export function createDefaultInvitationDocument():
  InvitationDocument {
  return {
    theme:
      "classic",

    pages:
      [],
  };
}