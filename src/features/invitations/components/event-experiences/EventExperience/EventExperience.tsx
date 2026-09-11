import type {
  CSSProperties,
  ReactNode,
} from "react";

import type {
  EventExperienceRenderMode,
} from "@/features/invitations/types/eventExperienceRenderer.types";

import "@/features/invitations/styles/eventExperienceTokens.css";
import "@/features/invitations/styles/eventExperienceVariants.css";

import "./EventExperience.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceProps {
  children:
    ReactNode;

  templateId:
    string;

  family:
    string;

  variantId:
    string;

  mode:
    EventExperienceRenderMode;

  cardAspectRatio:
    `${number} / ${number}`;
}


/* ==========================================================================
   Event Experience
========================================================================== */

export default function EventExperience({
  children,
  templateId,
  family,
  variantId,
  mode,
  cardAspectRatio,
}: EventExperienceProps) {
  /* ==========================================================================
     Style
  ========================================================================== */

  const style = {
    "--event-experience-card-aspect-ratio":
      cardAspectRatio,
  } as CSSProperties;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="event-experience"
      data-event-experience
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