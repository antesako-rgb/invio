"use client";

import {
  useTranslations,
} from "next-intl";

import BackLink
  from "@/components/ui/back-link/BackLink";

import DigitalAlbumPdfExportAction
  from "@/features/digital-albums/editor/components/DigitalAlbumPdfExportAction/DigitalAlbumPdfExportAction";

import EditorHeader
  from "@/features/editor/components/EditorHeader/EditorHeader";

import EditorSaveStatus
  from "@/features/editor/components/EditorSaveStatus/EditorSaveStatus";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumEditorHeaderProps {
  albumId:
    string;

}


/* ==========================================================================
   Digital Album Editor Header
========================================================================== */

export default function DigitalAlbumEditorHeader({
  albumId,
}: DigitalAlbumEditorHeaderProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "DigitalAlbumEditor"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EditorHeader
      start={
        <BackLink
          href="/dashboard/dogadaji"
          label={
            t(
              "navigation.back"
            )
          }
        />
      }
      end={
        <>
          <EditorSaveStatus
            status="saved"
            savingLabel={
              t(
                "status.saving"
              )
            }
            savedLabel={
              t(
                "status.saved"
              )
            }
            errorLabel={
              t(
                "status.error"
              )
            }
          />

          <DigitalAlbumPdfExportAction
            albumId={
              albumId
            }
          />
        </>
      }
    />
  );
}
