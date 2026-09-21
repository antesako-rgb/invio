"use client";

import {
  useRef,
  useState,
} from "react";

import type {
  KeyboardEvent,
  MouseEvent,
} from "react";

import styles
  from "./DigitalAlbumEditableText.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumEditableTextProps {
  value?:
    string;

  placeholder:
    string;

  editable?:
    boolean;

  className?:
    string;

  onChange?:
    (
      value:
        string
    ) => void;
}


/* ==========================================================================
   Digital Album Editable Text
========================================================================== */

export default function DigitalAlbumEditableText({
  value,
  placeholder,
  editable = false,
  className,
  onChange,
}: DigitalAlbumEditableTextProps) {
  /* ==========================================================================
     Ref
  ========================================================================== */

  const elementRef =
    useRef<HTMLSpanElement>(
      null
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isEditing,
    setIsEditing,
  ] =
    useState(false);

  const originalValueRef =
    useRef(
      value ?? ""
    );


  /* ==========================================================================
     Value
  ========================================================================== */

  const hasValue =
    Boolean(
      value?.trim()
    );

  const displayValue =
    hasValue
      ? value
      : editable
        ? placeholder
        : "";


  /* ==========================================================================
     Start Editing
  ========================================================================== */

  function startEditing() {
    if (
      !editable ||
      isEditing
    ) {
      return;
    }

    originalValueRef.current =
      value ?? "";

    setIsEditing(
      true
    );

    requestAnimationFrame(
      () => {
        const element =
          elementRef.current;

        if (!element) {
          return;
        }

        element.textContent =
          value ?? "";

        element.focus();

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
    );
  }


  /* ==========================================================================
     Finish Editing
  ========================================================================== */

  function finishEditing() {
    if (
      !isEditing
    ) {
      return;
    }

    const nextValue =
      elementRef.current
        ?.textContent
        ?.trim() ??
      "";

    setIsEditing(
      false
    );

    if (
      nextValue ===
        (value ?? "")
    ) {
      return;
    }

    onChange?.(
      nextValue
    );
  }


  /* ==========================================================================
     Cancel Editing
  ========================================================================== */

  function cancelEditing() {
    if (
      !isEditing
    ) {
      return;
    }

    if (
      elementRef.current
    ) {
      elementRef.current.textContent =
        originalValueRef.current;
    }

    setIsEditing(
      false
    );

    elementRef.current?.blur();
  }


  /* ==========================================================================
     Interaction
  ========================================================================== */

  function handleInteraction(
    event:
      MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    startEditing();
  }


  /* ==========================================================================
     Key Down
  ========================================================================== */

  function handleKeyDown(
    event:
      KeyboardEvent<HTMLSpanElement>
  ) {
    if (
      event.key ===
        "Enter"
    ) {
      event.preventDefault();

      elementRef.current?.blur();

      return;
    }

    if (
      event.key ===
        "Escape"
    ) {
      event.preventDefault();

      cancelEditing();
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <span
      className={[
        styles.root,
        className,
      ]
        .filter(Boolean)
        .join(" ")
      }
      data-editable={
        editable
          ? "true"
          : undefined
      }
      data-editing={
        isEditing
          ? "true"
          : undefined
      }
      data-placeholder={
        !hasValue
          ? "true"
          : undefined
      }
    >
      <span
        ref={
          elementRef
        }
        className={
          styles.value
        }
        tabIndex={
          isEditing
            ? 0
            : undefined
        }
        contentEditable={
          isEditing
            ? true
            : undefined
        }
        suppressContentEditableWarning={
          isEditing
        }
        spellCheck={
          isEditing
            ? false
            : undefined
        }
        onPointerDown={
          isEditing
            ? (event) => {
                event.stopPropagation();
              }
            : undefined
        }
        onMouseDown={
          isEditing
            ? (event) => {
                event.stopPropagation();
              }
            : undefined
        }
        onClick={
          isEditing
            ? (event) => {
                event.stopPropagation();
              }
            : undefined
        }
        onBlur={
          isEditing
            ? finishEditing
            : undefined
        }
        onKeyDown={
          isEditing
            ? handleKeyDown
            : undefined
        }
      >
        {isEditing
          ? null
          : displayValue}
      </span>

      {editable &&
        !isEditing && (
          <button
            type="button"
            className={
              styles.interaction
            }
            aria-label={
              displayValue ||
              placeholder
            }
            onPointerDown={
              (event) => {
                event.preventDefault();
                event.stopPropagation();
              }
            }
            onMouseDown={
              (event) => {
                event.preventDefault();
                event.stopPropagation();
              }
            }
            onClick={
              handleInteraction
            }
          />
        )}
    </span>
  );
}