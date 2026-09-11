import type {
  ReactNode,
} from "react";

import "./EventExperienceCardStage.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceCardStageProps {
  children:
    ReactNode;
}


/* ==========================================================================
   Event Experience Card Stage
========================================================================== */

export default function EventExperienceCardStage({
  children,
}: EventExperienceCardStageProps) {
  return (
    <div
      className="event-experience-card-stage"
    >
      {children}
    </div>
  );
}