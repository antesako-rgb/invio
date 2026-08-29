"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import type {
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  getInvitationElementStyle,
} from "@/features/invitations/editor/presentation/getInvitationElementStyle";

import {
  invitationEditorElements,
} from "@/features/invitations/editor/registry/invitationEditorElements";

import type {
  InvitationEditorContext,
  InvitationEditorSelection,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationRenderMode,
} from "@/features/invitations/types/invitationRenderer.types";


/* ==========================================================================
   Types
========================================================================== */

interface EditableTextProps {
  element:
    InvitationEditorSelection;

  mode:
    InvitationRenderMode;

  editor?:
    InvitationEditorContext;

  children:
    ReactNode;

  className?:
    string;
}

interface DeletePosition {
  top:
    number;

  left:
    number;
}


/* ==========================================================================
   Editable Text
========================================================================== */

export default function EditableText({
  element,
  mode,
  editor,
  children,
  className,
}: EditableTextProps) {
  const t =
    useTranslations(
      "Invitations.editor.elementLabels"
    );

  const elementRef =
    useRef<HTMLSpanElement>(
      null
    );

  const initialValueRef =
    useRef<string | null>(
      null
    );

  const [
    deletePosition,
    setDeletePosition,
  ] =
    useState<DeletePosition | null>(
      null
    );


  /* ==========================================================================
     Element
  ========================================================================== */

  const elementConfig =
    invitationEditorElements[
      element
    ];

  const editorLabel =
    t(
      elementConfig.labelKey
    );


  /* ==========================================================================
     Editor State
  ========================================================================== */

  const isEditorMode =
    mode === "edit" &&
    Boolean(editor);

  const isSelected =
    isEditorMode &&
    editor?.selectedElement ===
      element;

  const isTextEditing =
    isEditorMode &&
    editor?.editingElement ===
      element;

  const realValue =
    editor
      ? elementConfig.getValue(
          editor.content
        )
      : null;

  const isFallback =
    isEditorMode &&
    (
      realValue === null ||
      realValue.trim() === ""
    );

  const canDelete =
    isEditorMode &&
    isSelected &&
    elementConfig.type === "text" &&
    !isFallback;


  /* ==========================================================================
     Presentation
  ========================================================================== */

  const elementPresentation =
    editor?.presentation.elements?.[
      element
    ];

  const elementStyle =
    getInvitationElementStyle(
      elementPresentation
    );


  /* ==========================================================================
     Update Value
  ========================================================================== */

  function updateValue(
    value: string
  ) {
    if (!editor) {
      return;
    }

    editor.onContentChange(
      elementConfig.setValue(
        editor.content,
        value
      )
    );
  }


  /* ==========================================================================
     Delete Value
  ========================================================================== */

  function handleDelete(
    event:
      MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (
      !editor ||
      elementConfig.type !== "text"
    ) {
      return;
    }

    editor.onContentChange(
      elementConfig.setValue(
        editor.content,
        ""
      )
    );

    editor.onEndEdit();
  }


  /* ==========================================================================
     Delete Position
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
    ]
  );


  /* ==========================================================================
     Start Editing
  ========================================================================== */

  function handleClick(
    event:
      MouseEvent<HTMLSpanElement>
  ) {
    if (!editor) {
      return;
    }

    event.stopPropagation();

    editor.onSelectElement(
      element
    );

    if (
      editor.editingElement ===
      element
    ) {
      return;
    }

    initialValueRef.current =
      realValue;

    editor.onStartEdit(
      element
    );
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

      function handlePointerDown(
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
        handlePointerDown
      );

      return () => {
        document.removeEventListener(
          "pointerdown",
          handlePointerDown
        );
      };
    },
    [
      isTextEditing,
      editor,
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

    updateValue(
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
      event.key === "Escape"
    ) {
      event.preventDefault();

      const initialValue =
        initialValueRef.current;

      updateValue(
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
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <span
        ref={
          elementRef
        }
        className={
          className
        }
        style={
          elementStyle
        }
        tabIndex={
          isEditorMode
            ? 0
            : undefined
        }
        contentEditable={
          isTextEditing
            ? true
            : undefined
        }
        suppressContentEditableWarning={
          isTextEditing
        }
        spellCheck={
          isTextEditing
            ? false
            : undefined
        }
        data-editor-element={
          isEditorMode
            ? element
            : undefined
        }
        data-editor-label={
          isEditorMode
            ? editorLabel
            : undefined
        }
        data-editor-placeholder={
          isFallback
            ? "true"
            : undefined
        }
        data-editor-selected={
          isSelected
            ? "true"
            : undefined
        }
        data-editor-editing={
          isTextEditing
            ? "true"
            : undefined
        }
        onClick={
          isEditorMode
            ? handleClick
            : undefined
        }
        onInput={
          isTextEditing
            ? handleInput
            : undefined
        }
        onKeyDown={
          isTextEditing
            ? handleKeyDown
            : undefined
        }
      >
        {isTextEditing
          ? null
          : children}
      </span>

      {canDelete &&
        deletePosition &&
        createPortal(
          <button
            type="button"
            data-invitation-editor-ui
            data-editor-delete
            aria-label={
              t(
                "delete"
              )
            }
            style={{
              position:
                "absolute",

              top:
                deletePosition.top,

              left:
                deletePosition.left,
            }}
            onClick={
              handleDelete
            }
          >
            <X
              aria-hidden="true"
            />
          </button>,
          document.body
        )}
    </>
  );
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