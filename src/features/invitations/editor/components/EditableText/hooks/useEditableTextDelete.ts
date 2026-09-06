"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  MouseEvent,
  RefObject,
} from "react";

import type {
  InvitationEditorContext,
} from "@/features/invitations/editor/types/invitationEditor.types";


/* ==========================================================================
   Types
========================================================================== */

export interface EditableTextDeletePosition {
  top:
    number;

  left:
    number;
}

interface UseEditableTextDeleteOptions {
  editor:
    InvitationEditorContext | undefined;

  elementRef:
    RefObject<HTMLSpanElement | null>;

  canDelete:
    boolean;

  setValue:
    (
      value: string
    ) => void;
}


/* ==========================================================================
   Use Editable Text Delete
========================================================================== */

export function useEditableTextDelete({
  editor,
  elementRef,
  canDelete,
  setValue,
}: UseEditableTextDeleteOptions) {
  const [
    deletePosition,
    setDeletePosition,
  ] =
    useState<
      EditableTextDeletePosition | null
    >(
      null
    );


  /* ==========================================================================
     Delete
  ========================================================================== */

  function handleDelete(
    event:
      MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (
      !editor ||
      !canDelete
    ) {
      return;
    }

    setValue(
      ""
    );

    editor.onEndEdit();
  }


  /* ==========================================================================
     Position
  ========================================================================== */

  useEffect(
    () => {
      if (!canDelete) {
        setDeletePosition(
          null
        );

        return;
      }

      function updateDeletePosition() {
        const currentElement =
          elementRef.current;

        if (!currentElement) {
          return;
        }

        const rect =
          currentElement.getBoundingClientRect();

        setDeletePosition({
          top:
            rect.top +
            window.scrollY -
            28,

          left:
            rect.right +
            window.scrollX +
            6,
        });
      }

      updateDeletePosition();

      window.addEventListener(
        "resize",
        updateDeletePosition
      );

      window.addEventListener(
        "scroll",
        updateDeletePosition,
        true
      );

      return () => {
        window.removeEventListener(
          "resize",
          updateDeletePosition
        );

        window.removeEventListener(
          "scroll",
          updateDeletePosition,
          true
        );
      };
    },
    [
      canDelete,
      elementRef,
    ]
  );


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
    deletePosition,
    handleDelete,
  };
}