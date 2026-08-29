"use client";

import type {
  ReactNode,
} from "react";

import "./InvitationEditorWorkspace.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationEditorWorkspaceProps {
  sidebar?:
    ReactNode;

  toolbar?:
    ReactNode;

  children:
    ReactNode;
}


/* ==========================================================================
   Invitation Editor Workspace
========================================================================== */

export default function InvitationEditorWorkspace({
  sidebar,
  toolbar,
  children,
}: InvitationEditorWorkspaceProps) {
  return (
    <div
      className="invitation-editor-workspace"
      data-invitation-editor-workspace
    >
      {sidebar && (
        <aside
          className="invitation-editor-workspace__sidebar"
        >
          {sidebar}
        </aside>
      )}

      <div
        className="invitation-editor-workspace__canvas"
      >
        <div
          className="invitation-editor-workspace__canvas-inner"
        >
          <div
            className="invitation-editor-workspace__toolbar"
          >
            {toolbar}
          </div>

          <div
            className="invitation-editor-workspace__document"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}