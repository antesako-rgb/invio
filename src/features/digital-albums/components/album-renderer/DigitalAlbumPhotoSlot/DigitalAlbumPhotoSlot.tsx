"use client";
import {
  useEffect,
  useRef,
} from "react";

import type { MouseEvent, ReactNode } from "react";

import { Plus } from "lucide-react";

import { useTranslations } from "next-intl";

import styles from "./DigitalAlbumPhotoSlot.module.css";

/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPhotoSlotProps {
  slotId: string;

  children: ReactNode;

  active?: boolean;

  editable?: boolean;

  empty?: boolean;

  onSelect?: (slotId: string) => void;
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
  const select = useRef(onSelect);
  useEffect(() => {
    select.current = onSelect;
  }, [onSelect]);
  const press = useRef<{
    id: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    if (!editable) return;
    function move(event: PointerEvent) {
      const start = press.current;
      if (
        start?.id === event.pointerId &&
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8
      ) {
        start.moved = true;
      }
    }
    function finish(event: PointerEvent) {
      const start = press.current;
      if (!start || start.id !== event.pointerId) return;
      move(event);
      press.current = null;
      if (event.type === "pointerup" && !start.moved) select.current?.(slotId);
    }
    // OpenPageFlip captures the pointer on its book; observe completion there too.
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", finish, true);
    window.addEventListener("pointercancel", finish, true);
    return () => {
      press.current = null;
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", finish, true);
      window.removeEventListener("pointercancel", finish, true);
    };
  }, [editable, slotId]);

  /* ==========================================================================
     Translations
  ========================================================================== */

  const t = useTranslations("DigitalAlbumEditor.photoSlot");

  /* ==========================================================================
     Select
  ========================================================================== */

  function handleSelect(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!onSelect) {
      return;
    }

    if (event.detail === 0) onSelect(slotId);
  }

  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={styles.root}
      data-album-slot={slotId}
      data-editable={editable ? "true" : undefined}
      data-active={active ? "true" : undefined}
      data-empty={empty ? "true" : undefined}
    >
      {children}

      {editable && (
        <button
          type="button"
          className={styles.editorOverlay}
          aria-label={empty ? t("addPhoto") : t("selectPhoto")}
          data-album-photo-select
          onPointerDownCapture={(event) => {
            if (!event.isPrimary || event.button !== 0) return;
            press.current = {
              id: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              moved: false,
            };
          }}
          onClick={handleSelect}
        >
          {empty && (
            <span className={styles.emptyState}>
              <Plus className={styles.emptyIcon} aria-hidden="true" />

              <span>{t("addPhoto")}</span>
            </span>
          )}
        </button>
      )}
    </div>
  );
}
