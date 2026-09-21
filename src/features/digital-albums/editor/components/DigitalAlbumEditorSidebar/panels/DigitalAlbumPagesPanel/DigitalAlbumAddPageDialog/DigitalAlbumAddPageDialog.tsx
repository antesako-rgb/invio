"use client";

import {
  useTranslations,
} from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";

import DigitalAlbumLayoutPicker
  from "@/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/components/DigitalAlbumLayoutPicker/DigitalAlbumLayoutPicker";

import type {
  DigitalAlbumPageLayout,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumAddPageDialogProps {
  open:
    boolean;

  onOpenChange:
    (
      open:
        boolean
    ) => void;

  onAddPage:
    (
      layout:
        DigitalAlbumPageLayout
    ) => void;
}


/* ==========================================================================
   Digital Album Add Page Dialog
========================================================================== */

export default function DigitalAlbumAddPageDialog({
  open,
  onOpenChange,
  onAddPage,
}: DigitalAlbumAddPageDialogProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "DigitalAlbumEditor.pages.addDialog"
    );


  /* ==========================================================================
     Select Layout
  ========================================================================== */

  function handleSelectLayout(
    layout:
      DigitalAlbumPageLayout
  ) {
    onAddPage(
      layout
    );

    onOpenChange(
      false
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Dialog
      open={
        open
      }
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(
              "title"
            )}
          </DialogTitle>

          <DialogDescription>
            {t(
              "description"
            )}
          </DialogDescription>
        </DialogHeader>

        <DigitalAlbumLayoutPicker
          onChange={
            handleSelectLayout
          }
        />
      </DialogContent>
    </Dialog>
  );
}