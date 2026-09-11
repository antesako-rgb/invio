"use client";

import {
  useRef,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  useTranslations,
} from "next-intl";

import EditableTextDeleteButton
  from "@/features/invitations/editor/components/EditableText/components/EditableTextDeleteButton";

import {
  useEditableTextDelete,
} from "@/features/invitations/editor/components/EditableText/hooks/useEditableTextDelete";

import {
  useEditableTextEditing,
} from "@/features/invitations/editor/components/EditableText/hooks/useEditableTextEditing";

import {
  getEventExperienceElementStyle,
} from "@/features/invitations/editor/presentation/getEventExperienceElementStyle";

import {
  eventExperienceEditorElements,
} from "@/features/invitations/editor/registry/eventExperienceEditorElements";

import type {
  EventExperienceEditorContext,
  EventExperienceEditorSelection,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import {
  useEventExperiencePresentation,
} from "@/features/invitations/renderer/context/EventExperiencePresentationContext";

import type {
  EventExperienceRenderMode,
} from "@/features/invitations/types/eventExperienceRenderer.types";


/* ==========================================================================
   Types
========================================================================== */

interface EditableTextProps {
  element:
    EventExperienceEditorSelection;

  mode:
    EventExperienceRenderMode;

  editor?:
     EventExperienceEditorContext;

  children:
    ReactNode;

  className?:
    string;
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
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
     "EventExperiences.editor.elementLabels"
    );


  /* ==========================================================================
     Ref
  ========================================================================== */

  const elementRef =
    useRef<HTMLSpanElement>(
      null
    );


  /* ==========================================================================
     Element
  ========================================================================== */

  const elementConfig =
    eventExperienceEditorElements[
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

  const presentation =
    useEventExperiencePresentation();

  const elementPresentation =
    presentation.elements?.[
      element
    ];

  const elementStyle =
    getEventExperienceElementStyle(
      elementPresentation
    );


  /* ==========================================================================
     Value
  ========================================================================== */

  function setValue(
    value:
      string
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
     Editing
  ========================================================================== */

  const {
    handlePointerDown,
    handleInput,
    handleKeyDown,
  } =
    useEditableTextEditing({
      element,
      editor,
      elementRef,
      realValue,
      isTextEditing,
      setValue,
    });


  /* ==========================================================================
     Delete
  ========================================================================== */

  const {
    deletePosition,
    handleDelete,
  } =
    useEditableTextDelete({
      editor,
      elementRef,
      canDelete,
      setValue,
    });


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
        onPointerDown={
          isEditorMode
            ? handlePointerDown
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

      <EditableTextDeleteButton
        position={
          deletePosition
        }
        visible={
          canDelete
        }
        label={
          t(
            "delete"
          )
        }
        onDelete={
          handleDelete
        }
      />
    </>
  );
}