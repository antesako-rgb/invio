import type {
  EventExperienceEditorElementName,
} from "@/features/invitations/editor/registry/eventExperienceEditorElements";

import type {
  EventExperienceContent,
} from "@/features/invitations/types/eventExperienceContent.types";

import type {
  EventExperiencePresentation,
} from "@/features/invitations/types/eventExperiencePresentation.types";


/* ==========================================================================
   Event Experience Editor Selection
========================================================================== */

export type EventExperienceEditorSelection =
  EventExperienceEditorElementName;


/* ==========================================================================
   Event Experience Editor Step
========================================================================== */

export type EventExperienceEditorStep =
  | "design"
  | "details"
  | "rsvp";


/* ==========================================================================
   Event Experience Editor Save Status
========================================================================== */

export type EventExperienceEditorSaveStatus =
  | "saving"
  | "saved"
  | "error";


/* ==========================================================================
   Event Experience Editor Context
========================================================================== */

export interface EventExperienceEditorContext {
  experienceId:
    string;

  selectedElement:
    EventExperienceEditorSelection | null;

  editingElement:
    EventExperienceEditorSelection | null;

  content:
    EventExperienceContent;

  presentation:
    EventExperiencePresentation;

  onSelectElement:
    (
      element:
        EventExperienceEditorSelection
    ) => void;

  onStartEdit:
    (
      element:
        EventExperienceEditorSelection
    ) => void;

  onEndEdit:
    () => void;

  onContentChange:
    (
      content:
        EventExperienceContent
    ) => void;

  onPresentationChange:
    (
      presentation:
        EventExperiencePresentation
    ) => void;
}