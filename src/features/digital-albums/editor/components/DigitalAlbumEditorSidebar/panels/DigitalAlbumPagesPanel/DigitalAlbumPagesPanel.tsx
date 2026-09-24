"use client";

import { useState } from "react";

import type { ComponentProps } from "react";

import { Plus } from "lucide-react";

import { useTranslations } from "next-intl";

import { DragDropProvider } from "@dnd-kit/react";

import { Button } from "@/components/ui/button";

import DigitalAlbumAddPageDialog from "@/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumAddPageDialog/DigitalAlbumAddPageDialog";

import DigitalAlbumSortablePage from "@/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumSortablePage/DigitalAlbumSortablePage";

import type {
  DigitalAlbumDocumentPage,
  DigitalAlbumPageLayout,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";

import type { DigitalAlbumPhotoWithPhoto } from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import styles from "./DigitalAlbumPagesPanel.module.css";

/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPagesPanelProps {
  pages: DigitalAlbumDocumentPage[];

  photos: DigitalAlbumPhotoWithPhoto[];

  activePageId: string | null;

  visiblePageIndexes: number[];

  onSelectPage: (pageId: string) => void;

  onAddPage: (layout: DigitalAlbumPageLayout) => void;

  onDuplicatePage: (pageId: string) => void;

  onDeletePage: (pageId: string) => void;

  onSwapPages: (sourcePageId: string, targetPageId: string) => void;
}

type DragEndEvent = Parameters<
  NonNullable<ComponentProps<typeof DragDropProvider>["onDragEnd"]>
>[0];

/* ==========================================================================
   Digital Album Pages Panel
========================================================================== */

export default function DigitalAlbumPagesPanel({
  pages,
  photos,
  activePageId,
  visiblePageIndexes,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onSwapPages,
}: DigitalAlbumPagesPanelProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t = useTranslations("DigitalAlbumEditor.pages");

  /* ==========================================================================
     State
  ========================================================================== */

  const [isAddPageOpen, setIsAddPageOpen] = useState(false);

  /* ==========================================================================
     Add Page
  ========================================================================== */

  function handleOpenAddPage() {
    setIsAddPageOpen(true);
  }

  /* ==========================================================================
     Drag End
  ========================================================================== */

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) {
      return;
    }

    const { source, target } = event.operation;

    if (!source || !target) {
      return;
    }

    const sourcePageId = String(source.id);

    const targetPageId = String(target.id);

    if (sourcePageId === targetPageId) {
      return;
    }

    const sourceExists = pages.some((page) => page.id === sourcePageId);

    const targetExists = pages.some((page) => page.id === targetPageId);

    if (!sourceExists || !targetExists) {
      return;
    }

    onSwapPages(sourcePageId, targetPageId);
  }

  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.count}>
          {t("count", {
            count: pages.length,
          })}
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        className={styles.addButton}
        onClick={handleOpenAddPage}
      >
        <Plus aria-hidden="true" />

        {t("add")}
      </Button>

      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className={styles.list}>
          {pages.map((page, index) => {
            const isVisible = visiblePageIndexes.includes(index);

            return (
              <div
                key={page.id}
                className={styles.item}
                data-visible={isVisible ? "" : undefined}
              >
                <DigitalAlbumSortablePage
                  onMoveBefore={
                    index > 0
                      ? () => onSwapPages(page.id, pages[index - 1].id)
                      : undefined
                  }
                  onMoveAfter={
                    index < pages.length - 1
                      ? () => onSwapPages(page.id, pages[index + 1].id)
                      : undefined
                  }
                  page={page}
                  photos={photos}
                  pageNumber={index + 1}
                  isActive={activePageId === page.id}
                  canDelete={pages.length > 1}
                  onSelect={() => onSelectPage(page.id)}
                  onDuplicate={() => onDuplicatePage(page.id)}
                  onDelete={() => onDeletePage(page.id)}
                />

                <span className={styles.label}>
                  {t("page", {
                    number: index + 1,
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </DragDropProvider>

      <DigitalAlbumAddPageDialog
        open={isAddPageOpen}
        onOpenChange={setIsAddPageOpen}
        onAddPage={onAddPage}
      />
    </div>
  );
}
