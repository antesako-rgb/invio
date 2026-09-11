import type {
  CSSProperties,
  ReactNode,
} from "react";

import EditableImage
  from "@/features/invitations/editor/components/EditableImage/EditableImage";

import type {
  EventExperienceEditorContext,
  EventExperienceEditorSelection,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";
import type {
  EventExperienceRenderMode,
} from "@/features/invitations/types/eventExperienceRenderer.types";

import "./EventExperienceImageFrame.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceImageFrameProps {
  element:
    EventExperienceEditorSelection;

  value:
    string | null;

  mode:
    EventExperienceRenderMode;

  editor?:
    EventExperienceEditorContext;

  mask:
    string;

  frame:
    string;

  children?:
    ReactNode;

  className?:
    string;
}


/* ==========================================================================
   Event Experience Image Frame
========================================================================== */

export default function EventExperienceImageFrame({
  element,
  value,
  mode,
  editor,
  mask,
  frame,
  children,
  className,
}: EventExperienceImageFrameProps) {
  const imageStyle = {
    "--event-experience-image-frame-mask":
      `url("${mask}")`,
  } as CSSProperties;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={[
        "event-experience-image-frame",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        imageStyle
      }
    >
      {/* ====================================================================
          Image
      ==================================================================== */}

      <EditableImage
        element={
          element
        }
        value={
          value
        }
        mode={
          mode
        }
        editor={
          editor
        }
        className="event-experience-image-frame__image"
        imageClassName="event-experience-image-frame__image-content"
      >
        {children}
      </EditableImage>


      {/* ====================================================================
          Frame
      ==================================================================== */}

      <img
        className="event-experience-image-frame__frame"
        src={
          frame
        }
        alt=""
        aria-hidden="true"
        draggable={false}
      />
    </div>
  );
}