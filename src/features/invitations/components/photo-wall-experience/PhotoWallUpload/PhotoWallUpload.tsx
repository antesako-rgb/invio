"use client";

import {
  ArrowLeft,
  Loader2,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import FilePicker
  from "@/components/ui/file-picker/FilePicker";

import IconButton
  from "@/components/ui/icon-button/IconButton";

import PhotoWallDialog
  from "@/features/invitations/components/photo-wall-experience/PhotoWallDialog/PhotoWallDialog";

import {
  usePhotoWallUpload,
} from "@/features/invitations/components/photo-wall-experience/PhotoWallUpload/hooks/usePhotoWallUpload";

import PhotoWallPhotoComposer
  from "@/features/invitations/components/photo-wall-experience/PhotoWallUpload/PhotoWallPhotoComposer/PhotoWallPhotoComposer";

import PhotoWallUploadSource
  from "@/features/invitations/components/photo-wall-experience/PhotoWallUpload/PhotoWallUploadSource/PhotoWallUploadSource";

import type {
  PhotoWallPhoto,
} from "@/features/invitations/types/photoWallPhoto.types";

import PhotoUploadControls
  from "@/features/photo-upload/components/PhotoUploadControls/PhotoUploadControls";

import {
  ACCEPTED_IMAGE_TYPES_VALUE,
  MAX_FILES,
} from "@/features/photo-upload/constants/photoUpload.constants";

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
            <IconButton
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
            </IconButton>
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
                  <PhotoUploadControls
                    photos={
                      photos
                    }
                    activePhotoId={
                      activePhoto.id
                    }
                    disabled={
                      isBusy
                    }
                    isSubmitting={
                      isSubmitting
                    }
                    canAddMore={
                      photos.length <
                      MAX_FILES
                    }
                    selectPhotoLabel={
                      t(
                        "selectPhoto"
                      )
                    }
                    addMoreLabel={
                      t(
                        "addMore"
                      )
                    }
                    submitLabel={
                      t(
                        "submit",
                        {
                          count:
                            photos.length,
                        }
                      )
                    }
                    submittingLabel={
                      t(
                        "submitting"
                      )
                    }
                    onSelectPhoto={
                      selectPhoto
                    }
                    onAddMore={
                      openGallery
                    }
                    onSubmit={
                      submit
                    }
                  />
                )}
              </FilePicker>
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