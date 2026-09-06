"use client";

import {
  useId,
  useRef,
} from "react";

import type {
  ChangeEvent,
  ReactNode,
} from "react";

import {
  Camera,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";


/* ==========================================================================
   Types
========================================================================== */

interface FilePickerProps {
  accept?:
    string;

  label?:
    string;

  disabled?:
    boolean;

  children?:
    (
      openPicker: () => void
    ) => ReactNode;

  onSelect?:
    (file: File) => void;
}


/* ==========================================================================
   File Picker
========================================================================== */

export default function FilePicker({
  accept = "image/*",
  label,
  disabled = false,
  children,
  onSelect,
}: FilePickerProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Common.filePicker"
    );


  /* ==========================================================================
     Refs
  ========================================================================== */

  const id =
    useId();

  const inputRef =
    useRef<HTMLInputElement>(
      null
    );


  /* ==========================================================================
     Derived State
  ========================================================================== */

  const resolvedLabel =
    label ??
    t(
      "select"
    );


  /* ==========================================================================
     Open Picker
  ========================================================================== */

  function openPicker() {
    if (disabled) {
      return;
    }

    inputRef.current?.click();
  }


  /* ==========================================================================
     Change
  ========================================================================== */

  function handleChange(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value =
      "";

    if (!file) {
      return;
    }

    onSelect?.(
      file
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <Input
        ref={
          inputRef
        }
        id={
          id
        }
        type="file"
        accept={
          accept
        }
        className="sr-only"
        disabled={
          disabled
        }
        tabIndex={
          -1
        }
        onChange={
          handleChange
        }
      />

      {children ? (
        children(
          openPicker
        )
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={
            disabled
          }
          onClick={
            openPicker
          }
        >
          <Camera
            className="size-4"
            aria-hidden="true"
          />

          {resolvedLabel}
        </Button>
      )}
    </>
  );
}