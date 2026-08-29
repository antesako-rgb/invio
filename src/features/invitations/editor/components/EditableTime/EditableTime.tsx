"use client";

import {
  type MouseEvent,
  type ReactNode,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover/Popover";

import {
  TimePicker,
} from "@/components/ui/picker/TimePicker";

import {
  getInvitationElementStyle,
} from "@/features/invitations/editor/presentation/getInvitationElementStyle";

import {
  invitationEditorElements,
} from "@/features/invitations/editor/registry/invitationEditorElements";

import type {
  InvitationEditorContext,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationRenderMode,
} from "@/features/invitations/types/invitationRenderer.types";


/* ==========================================================================
   Constants
========================================================================== */

const TIME_ELEMENT =
  "time.start_time" as const;


/* ==========================================================================
   Types
========================================================================== */

interface EditableTimeProps {
  children:
    ReactNode;

  mode:
    InvitationRenderMode;

  editor?:
    InvitationEditorContext;
}


/* ==========================================================================
   Editable Time
========================================================================== */

export default function EditableTime({
  children,
  mode,
  editor,
}: EditableTimeProps) {
  const t =
    useTranslations(
      "Invitations.editor.time"
    );

  const tElementLabel =
    useTranslations(
      "Invitations.editor.elementLabels"
    );


  /* ==========================================================================
     Element
  ========================================================================== */

  const elementConfig =
    invitationEditorElements[
      TIME_ELEMENT
    ];

  const editorLabel =
    tElementLabel(
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
      TIME_ELEMENT;

  const startTime =
    editor?.content.time.start_time ??
    null;

  const endTime =
    editor?.content.time.end_time ??
    null;


  /* ==========================================================================
     Presentation
  ========================================================================== */

  const elementPresentation =
    editor?.presentation.elements?.[
      TIME_ELEMENT
    ];

  const elementStyle =
    getInvitationElementStyle(
      elementPresentation
    );

  const timeStyle = {
    ...elementStyle,

    textAlign:
      undefined,

    alignSelf:
      elementPresentation?.text_align === "left"
        ? "flex-start"
        : elementPresentation?.text_align === "right"
          ? "flex-end"
          : elementPresentation?.text_align === "center"
            ? "center"
            : undefined,
  };


  /* ==========================================================================
     Select
  ========================================================================== */

  function handleClick(
    event:
      MouseEvent<HTMLDivElement>
  ) {
    if (!editor) {
      return;
    }

    event.stopPropagation();

    editor.onSelectElement(
      TIME_ELEMENT
    );
  }


  /* ==========================================================================
     Update Start Time
  ========================================================================== */

  function handleStartTimeChange(
    value:
      string | null
  ) {
    if (!editor) {
      return;
    }

    editor.onContentChange({
      ...editor.content,

      time: {
        ...editor.content.time,

        start_time:
          value,
      },
    });
  }


  /* ==========================================================================
     Update End Time
  ========================================================================== */

  function handleEndTimeChange(
    value:
      string | null
  ) {
    if (!editor) {
      return;
    }

    editor.onContentChange({
      ...editor.content,

      time: {
        ...editor.content.time,

        end_time:
          value,
      },
    });
  }


  /* ==========================================================================
     Display
  ========================================================================== */

  if (!isEditorMode) {
    return (
      <div
        data-invitation-event-time
        style={
          timeStyle
        }
      >
        {children}
      </div>
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Popover>
      <PopoverTrigger
        nativeButton={
          false
        }
        render={
          <div
            data-invitation-event-time
            data-invitation-editor-ui
            data-editor-element={
              TIME_ELEMENT
            }
            data-editor-label={
              editorLabel
            }
            data-editor-selected={
              isSelected
                ? "true"
                : undefined
            }
            role="button"
            tabIndex={0}
            style={
              timeStyle
            }
            onClick={
              handleClick
            }
          >
            {children}
          </div>
        }
      />

      <PopoverContent
        sideOffset={8}
        className="w-72 space-y-5 rounded-xl border bg-popover p-4 shadow-xl"
        data-invitation-editor-ui
      >
        <div
          className="space-y-2"
        >
          <div
            className="text-sm font-medium"
          >
            {t(
              "startTime"
            )}
          </div>

          <TimePicker
            id="invitation_start_time"
            value={
              startTime
            }
            onChange={
              handleStartTimeChange
            }
            clearable
          />
        </div>

        <div
          className="space-y-2"
        >
          <div
            className="text-sm font-medium"
          >
            {t(
              "endTime"
            )}
          </div>

          <TimePicker
            id="invitation_end_time"
            value={
              endTime
            }
            onChange={
              handleEndTimeChange
            }
            clearable
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}