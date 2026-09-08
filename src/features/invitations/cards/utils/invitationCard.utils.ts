import type {
  InvitationTemplateCardConfig,
} from "@/features/invitations/types/invitationTemplateConfig.types";


/* ==========================================================================
   Types
========================================================================== */

export type InvitationCardOrientation =
  | "portrait"
  | "landscape"
  | "square";


/* ==========================================================================
   Get Invitation Card Orientation
========================================================================== */

export function getInvitationCardOrientation(
  aspectRatio:
    InvitationTemplateCardConfig["aspectRatio"]
): InvitationCardOrientation {
  const [
    width,
    height,
  ] =
    aspectRatio
      .split("/")
      .map(
        Number
      );

  if (
    width > height
  ) {
    return "landscape";
  }

  if (
    width < height
  ) {
    return "portrait";
  }

  return "square";
}