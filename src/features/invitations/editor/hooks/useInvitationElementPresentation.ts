import {
  useCallback,
} from "react";

import type {
  InvitationEditorSelection,
} from "@/features/invitations/editor/types/invitationEditor.types";

import {
  updateInvitationElementPresentation,
} from "@/features/invitations/editor/presentation/updateInvitationElementPresentation";

import type {
  InvitationElementPresentation,
  InvitationPresentation,
} from "@/features/invitations/types/invitationPresentation.types";


/* ==========================================================================
   Types
========================================================================== */

interface UseInvitationElementPresentationParams {
  element:
    InvitationEditorSelection;

  presentation:
    InvitationPresentation;

  onPresentationChange:
    (
      presentation: InvitationPresentation
    ) => void;
}


/* ==========================================================================
   Use Invitation Element Presentation
========================================================================== */

export function useInvitationElementPresentation({
  element,
  presentation,
  onPresentationChange,
}: UseInvitationElementPresentationParams) {
  /* ==========================================================================
     Element Presentation
  ========================================================================== */

  const elementPresentation =
    presentation.elements?.[
      element
    ];


  /* ==========================================================================
     Update Presentation
  ========================================================================== */

  const updatePresentation =
    useCallback(
      (
        changes:
          Partial<InvitationElementPresentation>
      ) => {
        onPresentationChange(
          updateInvitationElementPresentation(
            presentation,
            element,
            changes
          )
        );
      },
      [
        element,
        presentation,
        onPresentationChange,
      ]
    );


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
    elementPresentation,
    updatePresentation,
  };
}