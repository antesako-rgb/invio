"use client";

import type {
  ReactNode,
} from "react";

import "./EventExperienceEditorWorkspace.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceEditorWorkspaceProps {
  sidebar?:
    ReactNode;

  toolbar?:
    ReactNode;

  showMobileToolbar?:
    boolean;

  children:
    ReactNode;
}


/* ==========================================================================
   Event Experience Editor Workspace
========================================================================== */

export default function EventExperienceEditorWorkspace({
  sidebar,
  toolbar,
  showMobileToolbar = true,
  children,
}: EventExperienceEditorWorkspaceProps) {
  return (
    <div
      className="event-experience-editor-workspace"
      data-event-experience-editor-workspace
      data-mobile-toolbar={
        showMobileToolbar
          ? "visible"
          : "hidden"
      }
    >
      {sidebar && (
        <aside
          className="event-experience-editor-workspace__sidebar"
        >
          {sidebar}
        </aside>
      )}

      <div
        className="event-experience-editor-workspace__canvas"
      >
        <div
          className="event-experience-editor-workspace__canvas-inner"
        >
          <div
            className="event-experience-editor-workspace__toolbar"
          >
            {toolbar}
          </div>

          <div
            className="event-experience-editor-workspace__document"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}