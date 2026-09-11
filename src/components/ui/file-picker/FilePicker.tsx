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

  multiple?:
    boolean;

  capture?:
    "user" |
    "environment";

  disabled?:
    boolean;

  children?:
    (
      openPicker:
        () => void
    ) => ReactNode;

  onSelect?:
    (
      files:
        File[]
    ) => void;
}


/* ==========================================================================
   File Picker
========================================================================== */

export default function FilePicker({
  accept = "image/*",
  label,
  multiple = false,
  capture,
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
    if (
      disabled
    ) {
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
    const files =
      Array.from(
        event.target.files ??
        []
      );

    event.target.value =
      "";

    if (
      files.length ===
      0
    ) {
      return;
    }

    onSelect?.(
      files
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
        multiple={
          multiple
        }
        capture={
          capture
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

      {children
        ? (
            children(
              openPicker
            )
          )
        : (
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