import type {
  CSSProperties,
} from "react";

import type {
  EventExperienceElementPresentation,
} from "@/features/invitations/types/eventExperiencePresentation.types";


/* ==========================================================================
   Get Event Experience Element Style
========================================================================== */

export function getEventExperienceElementStyle(
  presentation:
    EventExperienceElementPresentation | undefined
): CSSProperties | undefined {
  if (!presentation) {
    return undefined;
  }

  return {
    fontFamily:
      presentation.font_family,

    fontSize:
      presentation.font_scale !== undefined
        ? `calc(var(--event-experience-element-font-size) * ${presentation.font_scale})`
        : undefined,

    color:
      presentation.color,

    fontStyle:
      presentation.font_style,

    fontWeight:
      presentation.font_weight,

    textAlign:
      presentation.text_align,
  };
}