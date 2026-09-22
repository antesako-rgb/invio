"use client";

import {
  useEffect,
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

  const originalValueRef =
    useRef(
      value ?? ""
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isEditing,
    setIsEditing,
  ] =
    useState(false);


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
     Outside Interaction
  ========================================================================== */

  useEffect(
    () => {
      if (
        !isEditing
      ) {
        return;
      }

      function handlePointerDown(
        event:
          PointerEvent
      ) {
        const element =
          elementRef.current;

        if (
          !element ||
          element.contains(
            event.target as Node
          )
        ) {
          return;
        }

        element.blur();
      }

      document.addEventListener(
        "pointerdown",
        handlePointerDown,
        true
      );

      return () => {
        document.removeEventListener(
          "pointerdown",
          handlePointerDown,
          true
        );
      };
    },
    [
      isEditing,
    ]
  );


  /* ==========================================================================
     Caret
  ========================================================================== */

  function placeCaretAtPoint(
    x:
      number,
    y:
      number
  ) {
    const element =
      elementRef.current;

    if (!element) {
      return;
    }

    const selection =
      window.getSelection();

    if (!selection) {
      return;
    }

    let range:
      Range | null =
        null;

    if (
      document.caretRangeFromPoint
    ) {
      range =
        document.caretRangeFromPoint(
          x,
          y
        );
    }

    if (
      range &&
      element.contains(
        range.startContainer
      )
    ) {
      selection.removeAllRanges();

      selection.addRange(
        range
      );

      return;
    }

    const fallbackRange =
      document.createRange();

    fallbackRange.selectNodeContents(
      element
    );

    fallbackRange.collapse(
      false
    );

    selection.removeAllRanges();

    selection.addRange(
      fallbackRange
    );
  }


  /* ==========================================================================
     Start Editing
  ========================================================================== */

  function startEditing(
    x:
      number,
    y:
      number
  ) {
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

        placeCaretAtPoint(
          x,
          y
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
        ?.innerText
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

    startEditing(
      event.clientX,
      event.clientY
    );
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
  onPointerDownCapture={
    isEditing
      ? (event) => {
          event.stopPropagation();
        }
      : undefined
  }
  onMouseDownCapture={
    isEditing
      ? (event) => {
          event.stopPropagation();
        }
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