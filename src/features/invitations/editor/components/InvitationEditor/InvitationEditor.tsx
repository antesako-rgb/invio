"use client";

import type {
  ReactNode,
} from "react";

import InvitationEditorHeader
  from "@/features/invitations/editor/components/InvitationEditorHeader/InvitationEditorHeader";

import InvitationEditorWorkspace
  from "@/features/invitations/editor/components/InvitationEditorWorkspace/InvitationEditorWorkspace";

import type {
  InvitationEditorSaveStatus,
} from "@/features/invitations/editor/types/invitationEditor.types";

import "@/features/invitations/styles/invitationEditor.css";

import "./InvitationEditor.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationEditorProps {
  children:
    ReactNode;

  sidebar?:
    ReactNode;

  toolbar?:
    ReactNode;

  saveStatus:
    InvitationEditorSaveStatus;

  onPreview:
    () => void;
}


/* ==========================================================================
   Invitation Editor
========================================================================== */

export default function InvitationEditor({
  children,
  sidebar,
  toolbar,
  saveStatus,
  onPreview,
}: InvitationEditorProps) {
  return (
    <div
      className="invitation-editor"
      data-invitation-editor
    >
      <InvitationEditorHeader
        activeStep="design"
        saveStatus={
          saveStatus
        }
        onPreview={
          onPreview
        }
      />

      <main
        className="invitation-editor__main"
      >
        <InvitationEditorWorkspace
          sidebar={
            sidebar
          }
          toolbar={
            toolbar
          }
        >
          {children}
        </InvitationEditorWorkspace>
      </main>
    </div>
  );
}