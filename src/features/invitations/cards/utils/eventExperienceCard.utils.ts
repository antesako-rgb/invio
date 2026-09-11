import type {
  EventExperienceTemplateCardConfig,
} from "@/features/invitations/types/eventExperienceTemplateConfig.types";


/* ==========================================================================
   Types
========================================================================== */

export type EventExperienceCardOrientation =
  | "portrait"
  | "landscape"
  | "square";


/* ==========================================================================
   Get Event Experience Card Orientation
========================================================================== */

export function getEventExperienceCardOrientation(
  aspectRatio:
    EventExperienceTemplateCardConfig["aspectRatio"]
): EventExperienceCardOrientation {
  const [
    width,
    height,
  ] =
    aspectRatio
      .split("/")
      .map(Number);

  if (width > height) {
    return "landscape";
  }

  if (width < height) {
    return "portrait";
  }

  return "square";
}