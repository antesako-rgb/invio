"use client";

import type {
  MouseEvent,
  ReactNode,
} from "react";

import {
  Plus,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import styles
  from "./DigitalAlbumPhotoSlot.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPhotoSlotProps {
  slotId:
    string;

  children:
    ReactNode;

  active?:
    boolean;

  editable?:
    boolean;

  empty?:
    boolean;

  onSelect?:
    (
      slotId:
        string
    ) => void;
}


/* ==========================================================================
   Digital Album Photo Slot
========================================================================== */

export default function DigitalAlbumPhotoSlot({
  slotId,
  children,
  active = false,
  editable = false,
  empty = false,
  onSelect,
}: DigitalAlbumPhotoSlotProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "DigitalAlbumEditor.photoSlot"
    );


  /* ==========================================================================
     Select
  ========================================================================== */

  function handleSelect(
    event:
      MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (
      !onSelect
    ) {
      return;
    }

    onSelect(
      slotId
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.root
      }
      data-editable={
        editable
          ? "true"
          : undefined
      }
      data-active={
        active
          ? "true"
          : undefined
      }
      data-empty={
        empty
          ? "true"
          : undefined
      }
    >
      {children}

      {editable && (
        <button
          type="button"
          className={
            styles.editorOverlay
          }
          aria-label={
            empty
              ? t(
                  "addPhoto"
                )
              : t(
                  "selectPhoto"
                )
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
            handleSelect
          }
        >
          {empty && (
            <span
              className={
                styles.emptyState
              }
            >
              <Plus
                className={
                  styles.emptyIcon
                }
                aria-hidden="true"
              />

              <span>
                {t(
                  "addPhoto"
                )}
              </span>
            </span>
          )}
        </button>
      )}
    </div>
  );
}