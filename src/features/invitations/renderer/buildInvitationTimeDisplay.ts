import type {
  InvitationTimeContent,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationTimeDisplay,
} from "@/features/invitations/types/invitationRenderer.types";


/* ==========================================================================
   Build Invitation Time Display
========================================================================== */

export function buildInvitationTimeDisplay(
  time: InvitationTimeContent
): InvitationTimeDisplay {
  if (
    !time.start_time
  ) {
    return {
      hasTime:
        false,

      text:
        "",
    };
  }

  const startTime =
    time.start_time.slice(
      0,
      5
    );

  const endTime =
    time.end_time
      ? time.end_time.slice(
          0,
          5
        )
      : null;

  return {
    hasTime:
      true,

    text:
      endTime
        ? `${startTime} – ${endTime}`
        : startTime,
  };
}