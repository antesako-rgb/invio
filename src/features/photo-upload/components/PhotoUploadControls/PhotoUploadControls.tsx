"use client";

import {
  ImagePlus,
} from "lucide-react";

import styles
  from "./PhotoUploadControls.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoUploadControlsPhoto {
  id:
    string;

  previewUrl:
    string;
}

interface PhotoUploadControlsProps {
  photos:
    PhotoUploadControlsPhoto[];

  activePhotoId:
    string;

  disabled?:
    boolean;

  isSubmitting?:
    boolean;

  canAddMore?:
    boolean;

  selectPhotoLabel:
    string;

  addMoreLabel:
    string;

  submitLabel:
    string;

  submittingLabel:
    string;

  onSelectPhoto:
    (
      id:
        string
    ) => void;

  onAddMore:
    () => void;

  onSubmit:
    () => void;
}


/* ==========================================================================
   Photo Upload Controls
========================================================================== */

export default function PhotoUploadControls({
  photos,
  activePhotoId,
  disabled = false,
  isSubmitting = false,
  canAddMore = true,
  selectPhotoLabel,
  addMoreLabel,
  submitLabel,
  submittingLabel,
  onSelectPhoto,
  onAddMore,
  onSubmit,
}: PhotoUploadControlsProps) {
  return (
    <div
      className={
        styles.root
      }
    >
      {/* ====================================================================
          Selected Photos
      ==================================================================== */}

      {photos.length > 1 && (
        <div
          className={
            styles.photos
          }
        >
          {photos.map(
            (photo) => (
              <button
                key={
                  photo.id
                }
                type="button"
                className={
                  styles.photo
                }
                data-active={
                  photo.id ===
                  activePhotoId
                    ? "true"
                    : "false"
                }
                disabled={
                  disabled
                }
                onClick={
                  () =>
                    onSelectPhoto(
                      photo.id
                    )
                }
                aria-label={
                  selectPhotoLabel
                }
              >
                <img
                  src={
                    photo.previewUrl
                  }
                  alt=""
                />
              </button>
            )
          )}
        </div>
      )}


      {/* ====================================================================
          Add More
      ==================================================================== */}

      {canAddMore && (
        <button
          type="button"
          className={
            styles.addMore
          }
          disabled={
            disabled
          }
          onClick={
            onAddMore
          }
        >
          <ImagePlus
            aria-hidden="true"
          />

          {addMoreLabel}
        </button>
      )}


      {/* ====================================================================
          Submit
      ==================================================================== */}

      <button
        type="button"
        className={
          styles.submit
        }
        disabled={
          disabled ||
          photos.length === 0
        }
        onClick={
          onSubmit
        }
      >
        {isSubmitting
          ? submittingLabel
          : submitLabel}
      </button>
    </div>
  );
}