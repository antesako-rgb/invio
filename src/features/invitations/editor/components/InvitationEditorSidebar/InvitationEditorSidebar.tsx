"use client";

import {
  useTranslations,
} from "next-intl";

import InvitationRSVPPanel
  from "@/features/invitations/editor/components/InvitationEditorSidebar/panels/InvitationRSVPPanel/InvitationRSVPPanel";

import type {
  InvitationEditorStep,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationContent,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationRSVPViewState,
} from "@/features/invitations/types/invitationRsvp.types";

import "./InvitationEditorSidebar.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationEditorSidebarProps {
  activeStep:
    InvitationEditorStep;

  content:
    InvitationContent;

  rsvpPreviewState:
    InvitationRSVPViewState;

  onContentChange:
    (
      content:
        InvitationContent
    ) => void;

  onRsvpPreviewStateChange:
    (
      state:
        InvitationRSVPViewState
    ) => void;
}


/* ==========================================================================
   Invitation Editor Sidebar
========================================================================== */

export default function InvitationEditorSidebar({
  activeStep,
  content,
  rsvpPreviewState,
  onContentChange,
  onRsvpPreviewStateChange,
}: InvitationEditorSidebarProps) {
  const t =
    useTranslations(
      "Invitations.editor"
    );


  /* ==========================================================================
     Title
  ========================================================================== */

  function getTitle() {
    switch (
      activeStep
    ) {
      case "details":
        return t(
          "navigation.details"
        );

      case "rsvp":
        return t(
          "navigation.rsvp"
        );

      case "design":
      default:
        return t(
          "navigation.design"
        );
    }
  }


  /* ==========================================================================
     RSVP
  ========================================================================== */

  function handleRsvpChange(
    rsvp:
      InvitationContent["rsvp"]
  ) {
    onContentChange({
      ...content,

      rsvp,
    });
  }


  /* ==========================================================================
     Content
  ========================================================================== */

  function renderContent() {
    switch (
      activeStep
    ) {
      case "details":
        return null;

      case "rsvp":
        return (
          <InvitationRSVPPanel
            rsvp={
              content.rsvp
            }
            previewState={
              rsvpPreviewState
            }
            onChange={
              handleRsvpChange
            }
            onPreviewStateChange={
              onRsvpPreviewStateChange
            }
          />
        );

      case "design":
      default:
        return null;
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <aside
      className="invitation-editor-sidebar"
      data-invitation-editor-sidebar
      data-step={
        activeStep
      }
    >
      {/* ====================================================================
          Header
      ==================================================================== */}

      <div
        className="invitation-editor-sidebar__header"
      >
        <h2
          className="invitation-editor-sidebar__title"
        >
          {getTitle()}
        </h2>
      </div>


      {/* ====================================================================
          Content
      ==================================================================== */}

      <div
        className="invitation-editor-sidebar__content"
      >
        {renderContent()}
      </div>
    </aside>
  );
}