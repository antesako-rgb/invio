"use client";

import {
  useEffect,
  useRef,
} from "react";

import type {
  FormEvent,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";

import type {
  InvitationEditorContext,
  InvitationEditorSelection,
} from "@/features/invitations/editor/types/invitationEditor.types";


/* ==========================================================================
   Types
========================================================================== */

interface UseEditableTextEditingOptions {
  element:
    InvitationEditorSelection;

  editor:
    InvitationEditorContext | undefined;

  elementRef:
    RefObject<HTMLSpanElement | null>;

  realValue:
    string | null;

  isTextEditing:
    boolean;

  setValue:
    (
      value: string
    ) => void;
}


/* ==========================================================================
   Use Editable Text Editing
========================================================================== */

export function useEditableTextEditing({
  element,
  editor,
  elementRef,
  realValue,
  isTextEditing,
  setValue,
}: UseEditableTextEditingOptions) {
  const initialValueRef =
    useRef<string | null>(
      null
    );


  /* ==========================================================================
     Start Editing
  ========================================================================== */

  function startEditing() {
    if (!editor) {
      return;
    }

    initialValueRef.current =
      realValue;

    editor.onStartEdit(
      element
    );
  }


  /* ==========================================================================
     Pointer Down
  ========================================================================== */

  function handlePointerDown(
    event:
      ReactPointerEvent<HTMLSpanElement>
  ) {
    if (!editor) {
      return;
    }

    event.stopPropagation();

    if (
      editor.editingElement ===
      element
    ) {
      return;
    }

    const wasSelected =
      editor.selectedElement ===
      element;

    editor.onSelectElement(
      element
    );

    const isDirectPointer =
      event.pointerType === "touch" ||
      event.pointerType === "pen";

    if (
      isDirectPointer &&
      !wasSelected
    ) {
      return;
    }

    startEditing();
  }


/* ==========================================================================
   Editing Focus
========================================================================== */

useEffect(
  () => {
    if (!isTextEditing) {
      return;
    }

    const currentElement =
      elementRef.current;

    if (!currentElement) {
      return;
    }

    currentElement.textContent =
      realValue ?? "";

    currentElement.focus();

    placeCaretAtEnd(
      currentElement
    );
  },
  [
    isTextEditing,
  ]
);


  /* ==========================================================================
     Click Outside
  ========================================================================== */

  useEffect(
    () => {
      if (
        !isTextEditing ||
        !editor
      ) {
        return;
      }

      const currentEditor =
        editor;

      function handlePointerDownOutside(
        event:
          PointerEvent
      ) {
        const target =
          event.target;

        if (
          !(target instanceof Element)
        ) {
          return;
        }

        const currentElement =
          elementRef.current;

        if (
          currentElement?.contains(
            target
          )
        ) {
          return;
        }

        if (
          target.closest(
            "[data-invitation-editor-toolbar]"
          )
        ) {
          return;
        }

        if (
          target.closest(
            "[data-invitation-editor-ui]"
          )
        ) {
          return;
        }

        currentEditor.onEndEdit();
      }

      document.addEventListener(
        "pointerdown",
        handlePointerDownOutside
      );

      return () => {
        document.removeEventListener(
          "pointerdown",
          handlePointerDownOutside
        );
      };
    },
    [
      isTextEditing,
      editor,
      elementRef,
    ]
  );


  /* ==========================================================================
     Input
  ========================================================================== */

  function handleInput(
    event:
      FormEvent<HTMLSpanElement>
  ) {
    if (!isTextEditing) {
      return;
    }

    setValue(
      event.currentTarget.innerText ??
        ""
    );
  }


  /* ==========================================================================
     Keyboard
  ========================================================================== */

  function handleKeyDown(
    event:
      KeyboardEvent<HTMLSpanElement>
  ) {
    if (
      !editor ||
      !isTextEditing
    ) {
      return;
    }

    if (
      event.key === "Enter" &&
      (
        event.ctrlKey ||
        event.metaKey
      )
    ) {
      event.preventDefault();

      editor.onEndEdit();

      return;
    }

    if (
      event.key !== "Escape"
    ) {
      return;
    }

    event.preventDefault();

    const initialValue =
      initialValueRef.current;

    setValue(
      initialValue ?? ""
    );

    const currentElement =
      elementRef.current;

    if (currentElement) {
      currentElement.textContent =
        initialValue ?? "";
    }

    editor.onEndEdit();
  }


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
    handlePointerDown,
    handleInput,
    handleKeyDown,
  };
}


/* ==========================================================================
   Place Caret At End
========================================================================== */

function placeCaretAtEnd(
  element:
    HTMLElement
) {
  const selection =
    window.getSelection();

  if (!selection) {
    return;
  }

  const range =
    document.createRange();

  range.selectNodeContents(
    element
  );

  range.collapse(
    false
  );

  selection.removeAllRanges();

  selection.addRange(
    range
  );
}