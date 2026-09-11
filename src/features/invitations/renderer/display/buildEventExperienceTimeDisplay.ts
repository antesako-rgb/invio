import type {
  EventExperienceTimeContent,
} from "@/features/invitations/types/eventExperienceContent.types";

import type {
  EventExperienceTimeDisplay,
} from "@/features/invitations/types/eventExperienceRenderer.types";


/* ==========================================================================
   Build Event Experience Time Display
========================================================================== */

export function buildEventExperienceTimeDisplay(
  time: EventExperienceTimeContent
): EventExperienceTimeDisplay {
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