import {
  useCallback,
} from "react";

import type {
  EventExperienceEditorSelection,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import {
  updateEventExperienceElementPresentation,
} from "@/features/invitations/editor/presentation/updateEventExperienceElementPresentation";

import type {
  EventExperienceElementPresentation,
  EventExperiencePresentation,
} from "@/features/invitations/types/eventExperiencePresentation.types";


/* ==========================================================================
   Types
========================================================================== */

interface UseEventExperienceElementPresentationParams {
  element:
    EventExperienceEditorSelection;

  presentation:
    EventExperiencePresentation;

  onPresentationChange:
    (
      presentation:
        EventExperiencePresentation
    ) => void;
}


/* ==========================================================================
   Use Event Experience Element Presentation
========================================================================== */

export function useEventExperienceElementPresentation({
  element,
  presentation,
  onPresentationChange,
}: UseEventExperienceElementPresentationParams) {
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
          Partial<EventExperienceElementPresentation>
      ) => {
        onPresentationChange(
          updateEventExperienceElementPresentation(
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