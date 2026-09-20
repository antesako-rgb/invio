"use client";

import type {
  ReactNode,
} from "react";

import {
  useTranslations,
} from "next-intl";

import EditorPreview
  from "@/features/editor/components/EditorPreview/EditorPreview";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumEditorPreviewProps {
  children:
    ReactNode;

  onClose:
    () => void;
}


/* ==========================================================================
   Digital Album Editor Preview
========================================================================== */

export default function DigitalAlbumEditorPreview({
  children,
  onClose,
}: DigitalAlbumEditorPreviewProps) {
  const t =
   useTranslations(
  "DigitalAlbumEditor.preview"
);


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EditorPreview
      closeLabel={
        t(
          "close"
        )
      }
      onClose={
        onClose
      }
    >
      {children}
    </EditorPreview>
  );
}