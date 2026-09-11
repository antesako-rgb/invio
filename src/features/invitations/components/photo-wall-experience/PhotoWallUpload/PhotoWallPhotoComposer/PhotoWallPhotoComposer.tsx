"use client";

import {
  Camera,
  Trash2,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import PhotoWallPhotoCard
  from "@/features/invitations/components/photo-wall-experience/PhotoWallPhotoCard/PhotoWallPhotoCard";

import "./PhotoWallPhotoComposer.css";


/* ==========================================================================
   Constants
========================================================================== */

const PREVIEW_WIDTH =
  1200;

const PREVIEW_HEIGHT =
  1200;


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallPhotoComposerProps {
  previewUrl:
    string;

  primaryName:
    string | null;

  secondaryName:
    string | null;

  date:
    string | null;

  description:
    string;

  onDescriptionChange:
    (
      value:
        string
    ) => void;

  onRemove?:
    () => void;
}


/* ==========================================================================
   Photo Wall Photo Composer
========================================================================== */

export default function PhotoWallPhotoComposer({
  previewUrl,
  primaryName,
  secondaryName,
  date,
  description,
  onDescriptionChange,
  onRemove,
}: PhotoWallPhotoComposerProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperiences.photoWall.composer"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="photo-wall-photo-composer"
    >
      <PhotoWallPhotoCard
        imageUrl={
          previewUrl
        }
        width={
          PREVIEW_WIDTH
        }
        height={
          PREVIEW_HEIGHT
        }
        primaryName={
          primaryName
        }
        secondaryName={
          secondaryName
        }
        date={
          date
        }
        photoAction={
          <span
            className="photo-wall-photo-composer__camera"
            aria-hidden="true"
          >
            <Camera />
          </span>
        }
        caption={
          <div
            className="photo-wall-photo-composer__caption"
          >
            <textarea
              value={
                description
              }
              rows={
                2
              }
              maxLength={
                300
              }
              className="photo-wall-photo-composer__description"
              placeholder={
                t(
                  "descriptionPlaceholder"
                )
              }
              aria-label={
                t(
                  "descriptionLabel"
                )
              }
              onChange={(
                event
              ) =>
                onDescriptionChange(
                  event.target.value
                )
              }
            />

            {onRemove && (
              <button
                type="button"
                className="photo-wall-photo-composer__remove"
                onClick={
                  onRemove
                }
                aria-label={
                  t(
                    "remove"
                  )
                }
              >
                <Trash2
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        }
      />
    </div>
  );
}