"use client";

import {
  ArrowLeft,
  ImagePlus,
  Loader2,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import FilePicker
  from "@/components/ui/file-picker/FilePicker";

import PhotoWallDialog
  from "@/features/invitations/components/photo-wall-experience/PhotoWallDialog/PhotoWallDialog";

import {
  ACCEPTED_IMAGE_TYPES_VALUE,
  MAX_FILES,
  usePhotoWallUpload,
} from "@/features/invitations/components/photo-wall-experience/PhotoWallUpload/hooks/usePhotoWallUpload";

import PhotoWallPhotoComposer
  from "@/features/invitations/components/photo-wall-experience/PhotoWallUpload/PhotoWallPhotoComposer/PhotoWallPhotoComposer";

import PhotoWallUploadSource
  from "@/features/invitations/components/photo-wall-experience/PhotoWallUpload/PhotoWallUploadSource/PhotoWallUploadSource";

import type {
  PhotoWallPhoto,
} from "@/features/invitations/types/photoWallPhoto.types";

import "./PhotoWallUpload.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallUploadProps {
  open:
    boolean;

  publicId:
    string;

  onOpenChange:
    (
      open:
        boolean
    ) => void;

  onSuccess:
    (
      photos:
        PhotoWallPhoto[]
    ) => void;
}


/* ==========================================================================
   Photo Wall Upload
========================================================================== */

export default function PhotoWallUpload({
  open,
  publicId,
  onOpenChange,
  onSuccess,
}: PhotoWallUploadProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperiences.photoWall.upload"
    );


  /* ==========================================================================
     Upload
  ========================================================================== */

  const {
    step,
    photos,
    activePhoto,
    error,
    isPreparing,
    isSubmitting,
    addFiles,
    changeDescription,
    removeActivePhoto,
    backToSource,
    selectPhoto,
    submit,
    reset,
  } =
    usePhotoWallUpload({
      publicId,

      invalidFilesError:
        t(
          "errors.invalidFiles"
        ),

      tooManyFilesError:
        t(
          "errors.tooManyFiles",
          {
            count:
              MAX_FILES,
          }
        ),

      uploadError:
        t(
          "errors.upload"
        ),

      onSuccess,
    });


  /* ==========================================================================
     State
  ========================================================================== */

  const isBusy =
    isPreparing ||
    isSubmitting;


  /* ==========================================================================
     Open Change
  ========================================================================== */

  function handleOpenChange(
    nextOpen:
      boolean
  ) {
    if (
      isBusy
    ) {
      return;
    }

    if (
      !nextOpen
    ) {
      reset();
    }

    onOpenChange(
      nextOpen
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <PhotoWallDialog
      open={
        open
      }
      onOpenChange={
        handleOpenChange
      }
      closeLabel={
        t(
          "close"
        )
      }
      disabled={
        isBusy
      }
    >
      <div
        className="photo-wall-upload"
        data-photo-wall-upload
      >
        {/* ==================================================================
            Navigation
        ================================================================== */}

        {step ===
          "composer" && (
          <div
            className="photo-wall-upload__navigation"
          >
            <button
              type="button"
              className="photo-wall-upload__navigation-button"
              disabled={
                isBusy
              }
              onClick={
                backToSource
              }
              aria-label={
                t(
                  "back"
                )
              }
            >
              <ArrowLeft
                aria-hidden="true"
              />
            </button>
          </div>
        )}


        {/* ==================================================================
            Content
        ================================================================== */}

        <div
          className="photo-wall-upload__content"
        >
          {/* ================================================================
              Source
          ================================================================ */}

          {step ===
            "source" && (
            <>
              <FilePicker
                accept={
                  ACCEPTED_IMAGE_TYPES_VALUE
                }
                capture="environment"
                onSelect={
                  addFiles
                }
              >
                {(openCamera) => (
                  <FilePicker
                    accept={
                      ACCEPTED_IMAGE_TYPES_VALUE
                    }
                    multiple
                    onSelect={
                      addFiles
                    }
                  >
                    {(openGallery) => (
                      <PhotoWallUploadSource
                        onCamera={
                          openCamera
                        }
                        onGallery={
                          openGallery
                        }
                        disabled={
                          isBusy
                        }
                      />
                    )}
                  </FilePicker>
                )}
              </FilePicker>

              {isPreparing && (
                <div
                  className="photo-wall-upload__preparing"
                  role="status"
                >
                  <Loader2
                    className="photo-wall-upload__preparing-icon"
                    aria-hidden="true"
                  />

                  <span>
                    {t(
                      "preparing"
                    )}
                  </span>
                </div>
              )}
            </>
          )}


          {/* ================================================================
              Composer
          ================================================================ */}

          {step ===
            "composer" &&
            activePhoto && (
            <>
              <PhotoWallPhotoComposer
                previewUrl={
                  activePhoto.previewUrl
                }
                description={
                  activePhoto.description
                }
                onDescriptionChange={
                  changeDescription
                }
                onRemove={
                  removeActivePhoto
                }
              />


              {/* ============================================================
                  Selected Photos
              ============================================================ */}

              {photos.length >
                1 && (
                <div
                  className="photo-wall-upload__photos"
                >
                  {photos.map(
                    (photo) => (
                      <button
                        key={
                          photo.id
                        }
                        type="button"
                        className="photo-wall-upload__photo"
                        data-active={
                          photo.id ===
                          activePhoto.id
                            ? "true"
                            : "false"
                        }
                        disabled={
                          isBusy
                        }
                        onClick={() =>
                          selectPhoto(
                            photo.id
                          )
                        }
                        aria-label={
                          t(
                            "selectPhoto"
                          )
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


              {/* ============================================================
                  Add More
              ============================================================ */}

              {photos.length <
                MAX_FILES && (
                <button
                  type="button"
                  className="photo-wall-upload__add-more"
                  disabled={
                    isBusy
                  }
                  onClick={
                    backToSource
                  }
                >
                  <ImagePlus
                    aria-hidden="true"
                  />

                  {t(
                    "addMore"
                  )}
                </button>
              )}


              {/* ============================================================
                  Submit
              ============================================================ */}

              <button
                type="button"
                className="photo-wall-upload__submit"
                disabled={
                  isBusy
                }
                onClick={
                  submit
                }
              >
                {isSubmitting
                  ? t(
                      "submitting"
                    )
                  : t(
                      "submit",
                      {
                        count:
                          photos.length,
                      }
                    )}
              </button>
            </>
          )}


          {/* ================================================================
              Error
          ================================================================ */}

          {error && (
            <p
              role="alert"
              className="photo-wall-upload__error"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </PhotoWallDialog>
  );
}