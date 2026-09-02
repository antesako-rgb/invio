"use client";

import {
  useRef,
  useState,
} from "react";

import type {
  KeyboardEvent,
} from "react";

import {
  Check,
  Pencil,
  X,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Button,
} from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip/tooltip";

import {
  updateInvitationNameAction,
} from "@/features/invitations/actions/invitation/updateInvitationNameAction";

import styles
  from "./InvitationNameEdit.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationNameEditProps {
  invitationId:
    string;

  name:
    string;
}


/* ==========================================================================
   Invitation Name Edit
========================================================================== */

export default function InvitationNameEdit({
  invitationId,
  name,
}: InvitationNameEditProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.name"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isEditing,
    setIsEditing,
  ] =
    useState(false);

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
    isSaving,
    setIsSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
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

    setError(
      null
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

    setError(
      null
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
      setError(
        null
      );

      setIsEditing(
        false
      );

      return;
    }

    setIsSaving(
      true
    );

    setError(
      null
    );

    try {
      const result =
        await updateInvitationNameAction({
          invitationId,
          name:
            trimmedValue,
        });

      if (!result.success) {
        setError(
          result.message
        );

        return;
      }

      const updatedName =
        result.data.name;

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
      setError(
        "UPDATE_FAILED"
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
      event.key === "Enter"
    ) {
      event.preventDefault();

      void handleSave();

      return;
    }

    if (
      event.key === "Escape"
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
                t(
                  "edit"
                )
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
            {t(
              "edit"
            )}
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
            t(
              "label"
            )
          }
          aria-invalid={
            Boolean(
              error
            )
          }
          disabled={
            isSaving
          }
          onChange={
            (event) => {
              setValue(
                event.target.value
              );

              if (error) {
                setError(
                  null
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
              variant="ghost"
              size="icon"
              className={
                styles.confirmButton
              }
              aria-label={
                t(
                  "save"
                )
              }
              disabled={
                isSaving ||
                !value.trim()
              }
              onClick={
                () => {
                  void handleSave();
                }
              }
            >
              <Check
                className="size-4"
                aria-hidden="true"
              />
            </Button>
          </TooltipTrigger>

          <TooltipContent>
            {t(
              "save"
            )}
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
    t(
      "cancel"
    )
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
            {t(
              "cancel"
            )}
          </TooltipContent>
        </Tooltip>
      </div>

      {error && (
        <span
          className={
            styles.error
          }
          role="alert"
        >
          {t(
            "error"
          )}
        </span>
      )}
    </div>
  );
}