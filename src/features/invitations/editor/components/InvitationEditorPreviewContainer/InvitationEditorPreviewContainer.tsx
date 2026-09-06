"use client";

import type {
  ReactNode,
} from "react";

import "./InvitationEditorPreviewContainer.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationEditorPreviewContainerProps {
  children:
    ReactNode;
}


/* ==========================================================================
   Invitation Editor Preview Container
========================================================================== */

export default function InvitationEditorPreviewContainer({
  children,
}: InvitationEditorPreviewContainerProps) {
  return (
    <div
      className="invitation-editor-preview-container"
      data-invitation-editor-preview-container
    >
      {children}
    </div>
  );
}