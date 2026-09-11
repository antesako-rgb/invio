"use client";

import {
  Camera,
  Images,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import "./PhotoWallUploadSource.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallUploadSourceProps {
  onCamera:
    () => void;

  onGallery:
    () => void;

  disabled?:
    boolean;
}


/* ==========================================================================
   Photo Wall Upload Source
========================================================================== */

export default function PhotoWallUploadSource({
  onCamera,
  onGallery,
  disabled = false,
}: PhotoWallUploadSourceProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperiences.photoWall.upload.source"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="photo-wall-upload-source"
    >
      {/* ====================================================================
          Header
      ==================================================================== */}

      <div
        className="photo-wall-upload-source__header"
      >
        <h2
          className="photo-wall-upload-source__title"
        >
          {t(
            "title"
          )}
        </h2>

        <p
          className="photo-wall-upload-source__description"
        >
          {t(
            "description"
          )}
        </p>
      </div>


      {/* ====================================================================
          Actions
      ==================================================================== */}

      <div
        className="photo-wall-upload-source__actions"
      >
        {/* ==================================================================
            Camera
        ================================================================== */}

        <button
          type="button"
          className="photo-wall-upload-source__action"
          disabled={
            disabled
          }
          onClick={
            onCamera
          }
        >
          <span
            className="photo-wall-upload-source__action-icon"
          >
            <Camera
              aria-hidden="true"
            />
          </span>

          <span
            className="photo-wall-upload-source__action-content"
          >
            <span
              className="photo-wall-upload-source__action-title"
            >
              {t(
                "camera.title"
              )}
            </span>

            <span
              className="photo-wall-upload-source__action-description"
            >
              {t(
                "camera.description"
              )}
            </span>
          </span>
        </button>


        {/* ==================================================================
            Gallery
        ================================================================== */}

        <button
          type="button"
          className="photo-wall-upload-source__action"
          disabled={
            disabled
          }
          onClick={
            onGallery
          }
        >
          <span
            className="photo-wall-upload-source__action-icon"
          >
            <Images
              aria-hidden="true"
            />
          </span>

          <span
            className="photo-wall-upload-source__action-content"
          >
            <span
              className="photo-wall-upload-source__action-title"
            >
              {t(
                "gallery.title"
              )}
            </span>

            <span
              className="photo-wall-upload-source__action-description"
            >
              {t(
                "gallery.description"
              )}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}