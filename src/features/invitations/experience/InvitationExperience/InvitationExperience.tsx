import type {
  CSSProperties,
  ReactNode,
} from "react";

import type {
  InvitationRenderMode,
} from "@/features/invitations/types/invitationRenderer.types";

import "@/features/invitations/styles/invitationTokens.css";
import "@/features/invitations/styles/invitationVariants.css";

import "./InvitationExperience.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationExperienceProps {
  children:
    ReactNode;

  templateId:
    string;

  family:
    string;

  variantId:
    string;

  mode:
    InvitationRenderMode;

  cardAspectRatio:
    `${number} / ${number}`;
}


/* ==========================================================================
   Invitation Experience
========================================================================== */

export default function InvitationExperience({
  children,
  templateId,
  family,
  variantId,
  mode,
  cardAspectRatio,
}: InvitationExperienceProps) {
  /* ==========================================================================
     Style
  ========================================================================== */

  const style = {
    "--invitation-card-aspect-ratio":
      cardAspectRatio,
  } as CSSProperties;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="invitation-experience"
      data-invitation-experience
      data-template={
        templateId
      }
      data-family={
        family
      }
      data-variant={
        variantId
      }
      data-mode={
        mode
      }
      style={
        style
      }
    >
      {children}
    </div>
  );
}