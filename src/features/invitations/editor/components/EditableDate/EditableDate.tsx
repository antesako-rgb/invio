"use client";

import {
  type MouseEvent,
  type ReactNode,
  useState,
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
  DatePicker,
} from "@/components/ui/picker/DatePicker";

import {
  getInvitationElementStyle,
} from "@/features/invitations/editor/presentation/getInvitationElementStyle";

import {
  invitationEditorElements,
} from "@/features/invitations/editor/registry/invitationEditorElements";

import type {
  InvitationEditorContext,
} from "@/features/invitations/editor/types/invitationEditor.types";

import {
  useInvitationPresentation,
} from "@/features/invitations/renderer/context/InvitationPresentationContext";

import type {
  InvitationRenderMode,
} from "@/features/invitations/types/invitationRenderer.types";

import {
  invitationDateSchema,
} from "@/features/invitations/validation/invitationContent.schema";


/* ==========================================================================
   Constants
========================================================================== */

const DATE_ELEMENT =
  "date.start_date" as const;


/* ==========================================================================
   Types
========================================================================== */

interface EditableDateDisplay {
  month:
    string;

  day:
    string;

  dayName:
    string;

  year:
    string;
}


interface EditableDateProps
  extends EditableDateDisplay {
  mode:
    InvitationRenderMode;

  editor?:
    InvitationEditorContext;

  children?:
    (
      display:
        EditableDateDisplay
    ) => ReactNode;
}


/* ==========================================================================
   Helpers
========================================================================== */

function parseDate(
  value:
    string | null
) {
  if (!value) {
    return undefined;
  }

  const [
    year,
    month,
    day,
  ] =
    value.split(
      "-"
    );

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );
}


function formatDate(
  value:
    Date | undefined
) {
  if (!value) {
    return null;
  }

  const year =
    value
      .getFullYear()
      .toString()
      .padStart(
        4,
        "0"
      );

  const month =
    String(
      value.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      value.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


/* ==========================================================================
   Default Date Display
========================================================================== */

function DefaultDateDisplay({
  month,
  day,
  dayName,
  year,
}: EditableDateDisplay) {
  return (
    <>
      <span
        data-invitation-event-month
      >
        {month}
      </span>

      <span
        data-invitation-event-day
      >
        <span
          data-invitation-event-day-name
        >
          {dayName}
        </span>

        <span
          data-invitation-event-day-value
        >
          {day}
        </span>
      </span>

      <span
        data-invitation-event-year
      >
        {year}
      </span>
    </>
  );
}


/* ==========================================================================
   Editable Date
========================================================================== */

export default function EditableDate({
  month,
  day,
  dayName,
  year,
  mode,
  editor,
  children,
}: EditableDateProps) {
  const t =
    useTranslations(
      "Invitations.editor.date"
    );

  const tValidation =
    useTranslations(
      "Invitations.editor.validation"
    );

  const tElementLabel =
    useTranslations(
      "Invitations.editor.elementLabels"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    validationError,
    setValidationError,
  ] =
    useState<string | null>(
      null
    );


  /* ==========================================================================
     Element
  ========================================================================== */

  const elementConfig =
    invitationEditorElements[
      DATE_ELEMENT
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
      DATE_ELEMENT;

  const startDate =
    parseDate(
      editor?.content.date.start_date ??
        null
    );

  const endDate =
    parseDate(
      editor?.content.date.end_date ??
        null
    );


  /* ==========================================================================
     Presentation
  ========================================================================== */

  const presentation =
    useInvitationPresentation();

  const elementPresentation =
    presentation.elements?.[
      DATE_ELEMENT
    ];

  const elementStyle =
    getInvitationElementStyle(
      elementPresentation
    );

  const dateStyle = {
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
     Display
  ========================================================================== */

  const display = {
    month,
    day,
    dayName,
    year,
  };

  const dateContent =
    children
      ? children(
          display
        )
      : (
          <DefaultDateDisplay
            {...display}
          />
        );


  /* ==========================================================================
     Validation
  ========================================================================== */

  function validateDate(
    startDate:
      string | null,
    endDate:
      string | null
  ) {
    const result =
      invitationDateSchema.safeParse({
        start_date:
          startDate,

        end_date:
          endDate,
      });

    if (result.success) {
      setValidationError(
        null
      );

      return true;
    }

    const issue =
      result.error.issues[0];

    setValidationError(
      issue?.message ??
        null
    );

    return false;
  }


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
      DATE_ELEMENT
    );
  }


  /* ==========================================================================
     Update Start Date
  ========================================================================== */

  function handleStartDateChange(
    value:
      Date | undefined
  ) {
    if (!editor) {
      return;
    }

    const nextStartDate =
      formatDate(
        value
      );

    const currentEndDate =
      editor.content.date.end_date;

    const shouldClearEndDate =
      !nextStartDate ||
      (
        currentEndDate !== null &&
        currentEndDate <
          nextStartDate
      );

    const nextEndDate =
      shouldClearEndDate
        ? null
        : currentEndDate;

    if (
      !validateDate(
        nextStartDate,
        nextEndDate
      )
    ) {
      return;
    }

    editor.onContentChange({
      ...editor.content,

      date: {
        ...editor.content.date,

        start_date:
          nextStartDate,

        end_date:
          nextEndDate,
      },
    });
  }


  /* ==========================================================================
     Update End Date
  ========================================================================== */

  function handleEndDateChange(
    value:
      Date | undefined
  ) {
    if (!editor) {
      return;
    }

    const nextEndDate =
      formatDate(
        value
      );

    const currentStartDate =
      editor.content.date.start_date;

    if (
      !validateDate(
        currentStartDate,
        nextEndDate
      )
    ) {
      return;
    }

    editor.onContentChange({
      ...editor.content,

      date: {
        ...editor.content.date,

        start_date:
          currentStartDate,

        end_date:
          nextEndDate,
      },
    });
  }


  /* ==========================================================================
     Live / Preview
  ========================================================================== */

  if (!isEditorMode) {
    return (
      <div
        data-invitation-event-date
        style={
          dateStyle
        }
      >
        {dateContent}
      </div>
    );
  }


  /* ==========================================================================
     Editor
  ========================================================================== */

  return (
    <Popover>
      <PopoverTrigger
        nativeButton={
          false
        }
        render={
          <div
            data-invitation-event-date
            data-invitation-editor-ui
            data-editor-element={
              DATE_ELEMENT
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
              dateStyle
            }
            onClick={
              handleClick
            }
          >
            {dateContent}
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
              "startDate"
            )}
          </div>

          <DatePicker
            id="invitation_start_date"
            value={
              startDate
            }
            onChange={
              handleStartDateChange
            }
            disablePast
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
              "endDate"
            )}
          </div>

          <DatePicker
            id="invitation_end_date"
            value={
              endDate
            }
            onChange={
              handleEndDateChange
            }
            minDate={
              startDate
            }
            disablePast
            clearable
          />

          {validationError && (
            <p
              className="text-xs text-destructive"
            >
              {tValidation(
                validationError
              )}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}