"use client";

import {
  ArrowLeft,
  ImagePlus,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog/dialog";

import FilePicker
  from "@/components/ui/file-picker/FilePicker";

import {
  ACCEPTED_IMAGE_TYPES_VALUE,
  MAX_FILES,
  usePhotoWallUpload,
} from "@/features/invitations/components/photo-wall-experience/PhotoWallUpload/hooks/usePhotoWallUpload";

import PhotoWallPhotoComposer
  from "@/features/invitations/components/photo-wall-experience/PhotoWallUpload/PhotoWallPhotoComposer/PhotoWallPhotoComposer";

import PhotoWallUploadSource
  from "@/features/invitations/components/photo-wall-experience/PhotoWallUpload/PhotoWallUploadSource/PhotoWallUploadSource";

import "./PhotoWallUpload.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallUploadProps {
  open:
    boolean;

  publicId:
    string;

  primaryName:
    string | null;

  secondaryName:
    string | null;

  date:
    string | null;

  onOpenChange:
    (
      open:
        boolean
    ) => void;

  onSuccess:
    () => void;
}


/* ==========================================================================
   Photo Wall Upload
========================================================================== */

export default function PhotoWallUpload({
  open,
  publicId,
  primaryName,
  secondaryName,
  date,
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
     Open Change
  ========================================================================== */

  function handleOpenChange(
    nextOpen:
      boolean
  ) {
    if (
      isSubmitting
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
    <Dialog
      open={
        open
      }
      onOpenChange={
        handleOpenChange
      }
    >
      <DialogContent
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
                isSubmitting
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
          {/* ==================================================================
              Source
          ================================================================== */}

          {step ===
            "source" && (
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
                    />
                  )}
                </FilePicker>
              )}
            </FilePicker>
          )}


          {/* ==================================================================
              Composer
          ================================================================== */}

          {step ===
            "composer" &&
            activePhoto && (
            <>
              <PhotoWallPhotoComposer
                previewUrl={
                  activePhoto.previewUrl
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
                          isSubmitting
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
                    isSubmitting
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
                  isSubmitting
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


          {/* ==================================================================
              Error
          ================================================================== */}

          {error && (
            <p
              role="alert"
              className="photo-wall-upload__error"
            >
              {error}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}