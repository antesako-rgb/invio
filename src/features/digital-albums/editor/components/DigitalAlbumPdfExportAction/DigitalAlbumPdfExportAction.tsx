"use client";

import {
  useEffect,
  useRef,
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

  const exportInFlight = useRef(false);
  const [retryDelay, setRetryDelay] = useState(0);
  useEffect(() => {
    if (!retryDelay) return;
    const timer = setTimeout(() => setRetryDelay(0), retryDelay * 1000);
    return () => clearTimeout(timer);
  }, [retryDelay]);


  /* ==========================================================================
     Export
  ========================================================================== */

  async function handleExport() {
    if (
      exportInFlight.current || retryDelay > 0
    ) {
      return;
    }

    exportInFlight.current = true;
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

      if (response.status === 429 || response.status === 503) {
        const header = response.headers.get("Retry-After");
        const seconds = header && /^\d+$/.test(header)
          ? Number(header)
          : header ? Math.ceil((Date.parse(header) - Date.now()) / 1000) : NaN;
        const delay = Number.isFinite(seconds) && seconds > 0
          ? Math.min(seconds, 3600)
          : 10;
        setRetryDelay(delay);
        setError(t(response.status === 429 ? "pdfExport.rateLimited" : "pdfExport.busy", { seconds: delay }));
        return;
      }

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
      exportInFlight.current = false;
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
          isExporting || retryDelay > 0
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
