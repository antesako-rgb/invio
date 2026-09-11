"use client";

import type {
  ReactNode,
} from "react";

import "./EventExperienceEditorPreviewContainer.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceEditorPreviewContainerProps {
  children:
    ReactNode;
}


/* ==========================================================================
   Event Experience Editor Preview Container
========================================================================== */

export default function EventExperienceEditorPreviewContainer({
  children,
}: EventExperienceEditorPreviewContainerProps) {
  return (
    <div
      className="event-experience-editor-preview-container"
      data-event-experience-editor-preview-container
    >
      {children}
    </div>
  );
}