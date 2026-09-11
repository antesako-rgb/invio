import EditableText
  from "@/features/invitations/editor/components/EditableText/EditableText";

import type {
  EventExperienceEditorContext
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import type {
  EventExperienceRenderMode,
} from "@/features/invitations/types/eventExperienceRenderer.types";

import "./EventExperienceDescription.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceDescriptionProps {
  value:
    string | null;

  mode:
    EventExperienceRenderMode;

  editor?:
    EventExperienceEditorContext;
}


/* ==========================================================================
   Event Experience Description
========================================================================== */

export default function EventExperienceDescription({
  value,
  mode,
  editor,
}: EventExperienceDescriptionProps) {
  if (!value) {
    return null;
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EditableText
      element="description"
      mode={
        mode
      }
      editor={
        editor
      }
      className="event-experience-description"
    >
      {value}
    </EditableText>
  );
}