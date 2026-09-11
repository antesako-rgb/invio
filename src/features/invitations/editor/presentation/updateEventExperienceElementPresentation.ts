import type {
  EventExperienceEditorSelection,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import type {
  EventExperienceElementPresentation,
  EventExperiencePresentation,
} from "@/features/invitations/types/eventExperiencePresentation.types";


/* ==========================================================================
   Update Event Experience Element Presentation
========================================================================== */

export function updateEventExperienceElementPresentation(
  presentation:
    EventExperiencePresentation,

  element:
    EventExperienceEditorSelection,

  changes:
    Partial<EventExperienceElementPresentation>
): EventExperiencePresentation {
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