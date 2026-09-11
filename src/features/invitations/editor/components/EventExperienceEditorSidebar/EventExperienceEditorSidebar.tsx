"use client";

import {
  useTranslations,
} from "next-intl";

import InvitationRSVPPanel
  from "@/features/invitations/editor/components/EventExperienceEditorSidebar/panels/InvitationRSVPPanel/InvitationRSVPPanel";

import type {
  EventExperienceEditorStep,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import type {
  EventExperienceContent,
} from "@/features/invitations/types/eventExperienceContent.types";

import type {
  InvitationRSVPViewState,
} from "@/features/invitations/types/invitationRsvp.types";

import "./EventExperienceEditorSidebar.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceEditorSidebarProps {
  activeStep:
    EventExperienceEditorStep;

  content:
    EventExperienceContent;

  rsvpPreviewState:
    InvitationRSVPViewState;

  onContentChange:
    (
      content:
        EventExperienceContent
    ) => void;

  onRsvpPreviewStateChange:
    (
      state:
        InvitationRSVPViewState
    ) => void;
}


/* ==========================================================================
   Event Experience Editor Sidebar
========================================================================== */

export default function EventExperienceEditorSidebar({
  activeStep,
  content,
  rsvpPreviewState,
  onContentChange,
  onRsvpPreviewStateChange,
}: EventExperienceEditorSidebarProps) {
const t =
  useTranslations(
    "EventExperiences.editor"
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
      EventExperienceContent["rsvp"]
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
      className="event-experience-editor-sidebar"
      data-event-experience-editor-sidebar
      data-step={
        activeStep
      }
    >
      {/* ====================================================================
          Header
      ==================================================================== */}

      <div
        className="event-experience-editor-sidebar__header"
      >
        <h2
          className="event-experience-editor-sidebar__title"
        >
          {getTitle()}
        </h2>
      </div>


      {/* ====================================================================
          Content
      ==================================================================== */}

      <div
        className="event-experience-editor-sidebar__content"
      >
        {renderContent()}
      </div>
    </aside>
  );
}