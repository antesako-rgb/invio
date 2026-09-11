"use client";

import EventExperienceFontFamilyControl
  from "@/features/invitations/editor/components/EventExperienceEditorToolbar/controls/EventExperienceFontFamilyControl/EventExperienceFontFamilyControl";

import EventExperienceSizeControl
  from "@/features/invitations/editor/components/EventExperienceEditorToolbar/controls/EventExperienceSizeControl/EventExperienceSizeControl";

import EventExperienceFontWeightControl
  from "@/features/invitations/editor/components/EventExperienceEditorToolbar/controls/EventExperienceFontWeightControl/EventExperienceFontWeightControl";

import EventExperienceFontStyleControl
  from "@/features/invitations/editor/components/EventExperienceEditorToolbar/controls/EventExperienceFontStyleControl/EventExperienceFontStyleControl";

import EventExperienceTextColorControl
  from "@/features/invitations/editor/components/EventExperienceEditorToolbar/controls/EventExperienceTextColorControl/EventExperienceTextColorControl";

import EventExperienceTextAlignControl
  from "@/features/invitations/editor/components/EventExperienceEditorToolbar/controls/EventExperienceTextAlignControl/EventExperienceTextAlignControl";

import type {
  EventExperienceEditorSelection,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import type {
  EventExperiencePresentation,
} from "@/features/invitations/types/eventExperiencePresentation.types";

import "./EventExperienceEditorToolbar.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceEditorToolbarProps {
  selectedElement:
    EventExperienceEditorSelection | null;

  presentation:
    EventExperiencePresentation;

  onPresentationChange:
    (
      presentation: EventExperiencePresentation
    ) => void;
}


/* ==========================================================================
   Event Experience Editor Toolbar
========================================================================== */

export default function EventExperienceEditorToolbar({
  selectedElement,
  presentation,
  onPresentationChange,
}: EventExperienceEditorToolbarProps) {
  if (!selectedElement) {
    return null;
  }

  const currentElement =
    selectedElement;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="event-experience-editor-toolbar"
      data-event-experience-editor-toolbar
      role="toolbar"
    >
      {/* ====================================================================
          Text Color
      ==================================================================== */}

      <EventExperienceTextColorControl
        element={
          currentElement
        }
        presentation={
          presentation
        }
        onPresentationChange={
          onPresentationChange
        }
      />


      {/* ====================================================================
          Font Family
      ==================================================================== */}

      <EventExperienceFontFamilyControl
        element={
          currentElement
        }
        presentation={
          presentation
        }
        onPresentationChange={
          onPresentationChange
        }
      />


      {/* ====================================================================
          Font Size
      ==================================================================== */}

      <EventExperienceSizeControl
        element={
          currentElement
        }
        presentation={
          presentation
        }
        onPresentationChange={
          onPresentationChange
        }
      />


      {/* ====================================================================
          Separator
      ==================================================================== */}

      <div
        className="event-experience-editor-toolbar__separator"
        aria-hidden="true"
      />


      {/* ====================================================================
          Font Weight
      ==================================================================== */}

      <EventExperienceFontWeightControl
        element={
          currentElement
        }
        presentation={
          presentation
        }
        onPresentationChange={
          onPresentationChange
        }
      />


      {/* ====================================================================
          Font Style
      ==================================================================== */}

      <EventExperienceFontStyleControl
        element={
          currentElement
        }
        presentation={
          presentation
        }
        onPresentationChange={
          onPresentationChange
        }
      />


      {/* ====================================================================
          Separator
      ==================================================================== */}

      <div
        className="event-experience-editor-toolbar__separator"
        aria-hidden="true"
      />


      {/* ====================================================================
          Text Align
      ==================================================================== */}

      <EventExperienceTextAlignControl
        element={
          currentElement
        }
        presentation={
          presentation
        }
        onPresentationChange={
          onPresentationChange
        }
      />
    </div>
  );
}