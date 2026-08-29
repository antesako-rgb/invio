import type {
  InvitationEditorSelection,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationElementPresentation,
  InvitationPresentation,
} from "@/features/invitations/types/invitationPresentation.types";


/* ==========================================================================
   Update Invitation Element Presentation
========================================================================== */

export function updateInvitationElementPresentation(
  presentation:
    InvitationPresentation,
  element:
    InvitationEditorSelection,
  changes:
    Partial<InvitationElementPresentation>
): InvitationPresentation {
  return {
    ...presentation,

    elements: {
      ...presentation.elements,

      [element]: {
        ...presentation.elements?.[
          element
        ],

        ...changes,
      },
    },
  };
}