import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Get Event Experience Public Path
========================================================================== */

export function getEventExperiencePublicPath(
  type:
    EventExperienceType,

  publicId:
    string
) {
  return `/${type}/${publicId}`;
}