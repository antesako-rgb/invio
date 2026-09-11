import type {
  EventExperienceLocationContent,
} from "@/features/invitations/types/eventExperienceContent.types";

import type {
  EventExperienceLocationDisplay,
} from "@/features/invitations/types/eventExperienceRenderer.types";


/* ==========================================================================
   Build Event Experience Location Display
========================================================================== */

export function buildEventExperienceLocationDisplay(
  location: EventExperienceLocationContent
): EventExperienceLocationDisplay {
  const venueName =
    location.name ?? "";

  const address =
    location.address ?? "";

  return {
    hasLocation:
      Boolean(
        venueName ||
        address
      ),

    venueName,

    address,
  };
}