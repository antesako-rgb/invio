"use client";

import {
  createPortal,
} from "react-dom";

import type {
  MouseEvent,
} from "react";

import {
  X,
} from "lucide-react";

import type {
  EditableTextDeletePosition,
} from "@/features/invitations/editor/components/EditableText/hooks/useEditableTextDelete";


/* ==========================================================================
   Types
========================================================================== */

interface EditableTextDeleteButtonProps {
  position:
    EditableTextDeletePosition | null;

  visible:
    boolean;

  label:
    string;

  onDelete:
    (
      event:
        MouseEvent<HTMLButtonElement>
    ) => void;
}


/* ==========================================================================
   Editable Text Delete Button
========================================================================== */

export default function EditableTextDeleteButton({
  position,
  visible,
  label,
  onDelete,
}: EditableTextDeleteButtonProps) {
  if (
    !visible ||
    !position
  ) {
    return null;
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return createPortal(
    <button
      type="button"
      data-invitation-editor-ui
      data-editor-delete
      aria-label={
        label
      }
      style={{
        position:
          "absolute",

        top:
          position.top,

        left:
          position.left,
      }}
      onClick={
        onDelete
      }
    >
      <X
        aria-hidden="true"
      />
    </button>,
    document.body
  );
}