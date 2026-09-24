"use client";

import {
  useState,
} from "react";

import {
  Download,
  LoaderCircle,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import styles
  from "./DigitalAlbumPdfExportAction.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPdfExportActionProps {
  albumId:
    string;
}


/* ==========================================================================
   Digital Album PDF Export Action
========================================================================== */

export default function DigitalAlbumPdfExportAction({
  albumId,
}: DigitalAlbumPdfExportActionProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "DigitalAlbumEditor"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isExporting,
    setIsExporting,
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
     Export
  ========================================================================== */

  async function handleExport() {
    if (
      isExporting
    ) {
      return;
    }

    setIsExporting(
      true
    );

    setError(
      null
    );

    try {
      const response =
        await fetch(
          `/api/digital-albums/${albumId}/pdf`,
          {
            method:
              "POST",
          }
        );

      if (
        !response.ok
      ) {
        throw new Error(
          "PDF export failed."
        );
      }

      const blob =
        await response.blob();

      if (
        blob.size ===
          0
      ) {
        throw new Error(
          "PDF export returned an empty file."
        );
      }

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        url;

      link.download =
        "digital-album.pdf";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      setTimeout(
        () => {
          URL.revokeObjectURL(
            url
          );
        },
        1000
      );
    } catch (
      exportError
    ) {
      console.error(
        "Digital album PDF export error:",
        exportError
      );

      setError(
        t(
          "pdfExport.error"
        )
      );
    } finally {
      setIsExporting(
        false
      );
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.root
      }
    >
      <button
        type="button"
        className={
          styles.button
        }
        disabled={
          isExporting
        }
        onClick={
          handleExport
        }
      >
        {isExporting
          ? (
              <LoaderCircle
                className={
                  styles.spinner
                }
                aria-hidden="true"
              />
            )
          : (
              <Download
                className={
                  styles.icon
                }
                aria-hidden="true"
              />
            )}

        <span>
          {isExporting
            ? t(
                "pdfExport.exporting"
              )
            : t(
                "pdfExport.action"
              )}
        </span>
      </button>

      {error && (
        <span
          className={
            styles.error
          }
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}