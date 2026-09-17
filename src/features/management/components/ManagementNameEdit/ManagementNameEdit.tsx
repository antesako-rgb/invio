"use client";

import {
  Check,
  Pencil,
  X,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import type {
  KeyboardEvent,
} from "react";

import {
  Button,
} from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip/tooltip";

import styles
  from "./ManagementNameEdit.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface ManagementNameEditProps {
  name:
    string;

  editLabel:
    string;

  inputLabel:
    string;

  saveLabel:
    string;

  cancelLabel:
    string;

  errorLabel:
    string;

  onSave:
    (
      name:
        string
    ) => Promise<string>;
}


/* ==========================================================================
   Management Name Edit
========================================================================== */

export default function ManagementNameEdit({
  name,
  editLabel,
  inputLabel,
  saveLabel,
  cancelLabel,
  errorLabel,
  onSave,
}: ManagementNameEditProps) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    savedName,
    setSavedName,
  ] =
    useState(
      name
    );

  const [
    value,
    setValue,
  ] =
    useState(
      name
    );

  const [
    isEditing,
    setIsEditing,
  ] =
    useState(
      false
    );

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(
      false
    );

  const [
    hasError,
    setHasError,
  ] =
    useState(
      false
    );


  /* ==========================================================================
     Refs
  ========================================================================== */

  const inputRef =
    useRef<HTMLInputElement>(
      null
    );


  /* ==========================================================================
     Edit
  ========================================================================== */

  function handleEdit() {
    setValue(
      savedName
    );

    setHasError(
      false
    );

    setIsEditing(
      true
    );

    window.requestAnimationFrame(
      () => {
        inputRef.current?.focus();

        inputRef.current?.select();
      }
    );
  }


  /* ==========================================================================
     Cancel
  ========================================================================== */

  function handleCancel() {
    if (isSaving) {
      return;
    }

    setValue(
      savedName
    );

    setHasError(
      false
    );

    setIsEditing(
      false
    );
  }


  /* ==========================================================================
     Save
  ========================================================================== */

  async function handleSave() {
    const trimmedValue =
      value.trim();

    if (
      isSaving ||
      !trimmedValue
    ) {
      return;
    }

    if (
      trimmedValue ===
      savedName
    ) {
      setHasError(
        false
      );

      setIsEditing(
        false
      );

      return;
    }

    setIsSaving(
      true
    );

    setHasError(
      false
    );

    try {
      const updatedName =
        await onSave(
          trimmedValue
        );

      setSavedName(
        updatedName
      );

      setValue(
        updatedName
      );

      setIsEditing(
        false
      );
    } catch {
      setHasError(
        true
      );
    } finally {
      setIsSaving(
        false
      );
    }
  }


  /* ==========================================================================
     Keyboard
  ========================================================================== */

  function handleKeyDown(
    event:
      KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key ===
      "Enter"
    ) {
      event.preventDefault();

      void handleSave();

      return;
    }

    if (
      event.key ===
      "Escape"
    ) {
      event.preventDefault();

      handleCancel();
    }
  }


  /* ==========================================================================
     View
  ========================================================================== */

  if (!isEditing) {
    return (
      <div
        className={
          styles.view
        }
      >
        <h1
          className={
            styles.title
          }
        >
          {savedName}
        </h1>

        <Tooltip>
          <TooltipTrigger
            asChild
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={
                styles.editButton
              }
              aria-label={
                editLabel
              }
              onClick={
                handleEdit
              }
            >
              <Pencil
                className="size-4"
                aria-hidden="true"
              />
            </Button>
          </TooltipTrigger>

          <TooltipContent>
            {editLabel}
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }


  /* ==========================================================================
     Edit View
  ========================================================================== */

  return (
    <div
      className={
        styles.editing
      }
    >
      <div
        className={
          styles.editor
        }
      >
        <input
          ref={
            inputRef
          }
          type="text"
          value={
            value
          }
          className={
            styles.input
          }
          aria-label={
            inputLabel
          }
          aria-invalid={
            hasError
          }
          disabled={
            isSaving
          }
          onChange={
            (event) => {
              setValue(
                event.target.value
              );

              if (hasError) {
                setHasError(
                  false
                );
              }
            }
          }
          onKeyDown={
            handleKeyDown
          }
        />

        <Tooltip>
          <TooltipTrigger
            asChild
          >
            <Button
              type="button"
              size="icon"
              className={
                styles.saveButton
              }
              aria-label={
                saveLabel
              }
              disabled={
                isSaving
              }
              onClick={() => {
                void handleSave();
              }}
            >
              <Check
                className="size-4"
                aria-hidden="true"
              />
            </Button>
          </TooltipTrigger>

          <TooltipContent>
            {saveLabel}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            asChild
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={
                styles.cancelButton
              }
              aria-label={
                cancelLabel
              }
              disabled={
                isSaving
              }
              onClick={
                handleCancel
              }
            >
              <X
                className="size-4"
                aria-hidden="true"
              />
            </Button>
          </TooltipTrigger>

          <TooltipContent>
            {cancelLabel}
          </TooltipContent>
        </Tooltip>
      </div>

      {hasError && (
        <span
          className={
            styles.error
          }
          role="alert"
        >
          {errorLabel}
        </span>
      )}
    </div>
  );
}