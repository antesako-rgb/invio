import type {
  CSSProperties,
} from "react";

import type {
  InvitationElementPresentation,
} from "@/features/invitations/types/invitationPresentation.types";


/* ==========================================================================
   Get Invitation Element Style
========================================================================== */

export function getInvitationElementStyle(
  presentation:
    InvitationElementPresentation | undefined
): CSSProperties | undefined {
  if (!presentation) {
    return undefined;
  }

  return {
    fontFamily:
      presentation.font_family,

    fontSize:
      presentation.font_scale !== undefined
        ? `calc(var(--invitation-element-font-size) * ${presentation.font_scale})`
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