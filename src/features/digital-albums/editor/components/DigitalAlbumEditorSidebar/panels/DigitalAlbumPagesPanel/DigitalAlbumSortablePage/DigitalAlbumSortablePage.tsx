"use client";

import { Copy, GripVertical, MoreHorizontal, Trash2 } from "lucide-react";

import { useTranslations } from "next-intl";

import { useDraggable, useDroppable } from "@dnd-kit/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import DigitalAlbumPagePreview from "@/features/digital-albums/components/album-renderer/DigitalAlbumPagePreview/DigitalAlbumPagePreview";

import type { DigitalAlbumDocumentPage } from "@/features/digital-albums/types/digitalAlbumDocument.types";

import type { DigitalAlbumPhotoWithPhoto } from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import styles from "./DigitalAlbumSortablePage.module.css";

/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumSortablePageProps {
  onMoveBefore?: () => void;
  onMoveAfter?: () => void;
  page: DigitalAlbumDocumentPage;

  photos: DigitalAlbumPhotoWithPhoto[];

  pageNumber: number;

  isActive: boolean;

  canDelete: boolean;

  onSelect: () => void;

  onDuplicate: () => void;

  onDelete: () => void;
}

/* ==========================================================================
   Digital Album Sortable Page
========================================================================== */

export default function DigitalAlbumSortablePage({
  page,
  onMoveBefore,
  onMoveAfter,
  photos,
  pageNumber,
  isActive,
  canDelete,
  onSelect,
  onDuplicate,
  onDelete,
}: DigitalAlbumSortablePageProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const u = useTranslations("DigitalAlbumEditor.upgrade");
  const t = useTranslations("DigitalAlbumEditor.pages");

  /* ==========================================================================
     Drag
  ========================================================================== */

  const {
    ref: draggableRef,

    handleRef,

    isDragging,
  } = useDraggable({
    id: page.id,
  });

  /* ==========================================================================
     Drop
  ========================================================================== */

  const {
    ref: droppableRef,

    isDropTarget,
  } = useDroppable({
    id: page.id,
  });

  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      ref={draggableRef}
      className={styles.root}
      data-dragging={isDragging ? "" : undefined}
    >
      <div
        ref={droppableRef}
        className={styles.dropTarget}
        data-drop-target={isDropTarget && !isDragging ? "" : undefined}
      >
        <button
          type="button"
          className={styles.page}
          data-active={isActive ? "" : undefined}
          onClick={onSelect}
          aria-label={t("page", {
            number: pageNumber,
          })}
        >
          <DigitalAlbumPagePreview page={page} photos={photos} />
        </button>

        <button
          ref={handleRef}
          type="button"
          className={styles.dragHandle}
          aria-label={t("move", { number: pageNumber })}
        >
          <GripVertical aria-hidden="true" />
        </button>

        <div className={styles.actions}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className={styles.actionsTrigger}
                  aria-label={t("actions")}
                />
              }
            >
              <MoreHorizontal aria-hidden="true" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={6}>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy aria-hidden="true" />

                {t("duplicate")}
              </DropdownMenuItem>

              <DropdownMenuItem disabled={!onMoveBefore} onClick={onMoveBefore}>
                {u("moveBefore")}
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!onMoveAfter} onClick={onMoveAfter}>
                {u("moveAfter")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                disabled={!canDelete}
                onClick={onDelete}
              >
                <Trash2 aria-hidden="true" />

                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
