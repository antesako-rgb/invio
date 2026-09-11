"use client";

import {
  Images,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import "./PhotoWallActions.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallActionsProps {
  onPhotos:
    () => void;
}


/* ==========================================================================
   Photo Wall Actions
========================================================================== */

export default function PhotoWallActions({
  onPhotos,
}: PhotoWallActionsProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperiences.photoWall.actions"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="photo-wall-actions"
    >
      <button
        type="button"
        className="photo-wall-actions__button"
        onClick={
          onPhotos
        }
      >
        <Images
          className="photo-wall-actions__icon"
          aria-hidden="true"
        />

        <span>
          {t(
            "viewPhotos"
          )}
        </span>
      </button>
    </div>
  );
}