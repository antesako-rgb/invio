import type {
  CSSProperties,
  ReactNode,
} from "react";

import EditableImage
  from "@/features/invitations/editor/components/EditableImage/EditableImage";

import type {
  InvitationEditorContext,
  InvitationEditorSelection,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationRenderMode,
} from "@/features/invitations/types/invitationRenderer.types";
import "./InvitationImageFrame.css";

/* ==========================================================================
   Types
========================================================================== */

interface InvitationImageFrameProps {
  element:
    InvitationEditorSelection;

  value:
    string | null;

  mode:
    InvitationRenderMode;

  editor?:
    InvitationEditorContext;

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
   Invitation Image Frame
========================================================================== */

export default function InvitationImageFrame({
  element,
  value,
  mode,
  editor,
  mask,
  frame,
  children,
  className,
}: InvitationImageFrameProps) {
  const imageStyle = {
    "--invitation-image-frame-mask":
      `url("${mask}")`,
  } as CSSProperties;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={[
        "invitation-image-frame",
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
        className="invitation-image-frame__image"
        imageClassName="invitation-image-frame__image-content"
      >
        {children}
      </EditableImage>


      {/* ====================================================================
          Frame
      ==================================================================== */}

      <img
        className="invitation-image-frame__frame"
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