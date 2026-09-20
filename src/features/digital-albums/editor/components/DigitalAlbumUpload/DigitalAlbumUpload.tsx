"use client";

import {
  ArrowLeft,
  Loader2,
} from "lucide-react";

import {
  useEffect,
  useRef,
} from "react";

import {
  useTranslations,
} from "next-intl";

import FilePicker
  from "@/components/ui/file-picker/FilePicker";

import IconButton
  from "@/components/ui/icon-button/IconButton";

import {
  useDigitalAlbumUpload,
} from "@/features/digital-albums/editor/hooks/useDigitalAlbumUpload";

import type {
  DigitalAlbumPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import PhotoUploadComposer
  from "@/features/photo-upload/components/PhotoUploadComposer/PhotoUploadComposer";

import PhotoUploadControls
  from "@/features/photo-upload/components/PhotoUploadControls/PhotoUploadControls";

import {
  ACCEPTED_IMAGE_TYPES_VALUE,
  MAX_FILES,
} from "@/features/photo-upload/constants/photoUpload.constants";

import styles
  from "./DigitalAlbumUpload.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumUploadProps {
  albumId:
    string;

  initialFiles:
    File[];

  onSuccess:
    (
      photos:
        DigitalAlbumPhoto[]
    ) => void;

  onBack:
    () => void;
}


/* ==========================================================================
   Digital Album Upload
========================================================================== */

export default function DigitalAlbumUpload({
  albumId,
  initialFiles,
  onSuccess,
  onBack,
}: DigitalAlbumUploadProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "DigitalAlbumEditor.photos.upload"
    );


  /* ==========================================================================
     Upload
  ========================================================================== */

  const {
    photos,
    activePhoto,
    error,
    isPreparing,
    isSubmitting,
    addFiles,
    removeActivePhoto,
    selectPhoto,
    setActivePhotoDescription,
    submit,
  } =
useDigitalAlbumUpload({
  albumId,

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

  onEmpty:
    onBack,
});


  /* ==========================================================================
     Refs
  ========================================================================== */

  const initialFilesHandledRef =
    useRef(
      false
    );


  /* ==========================================================================
     Initial Files
  ========================================================================== */

  useEffect(
    () => {
      if (
        initialFilesHandledRef.current ||
        initialFiles.length === 0
      ) {
        return;
      }

      initialFilesHandledRef.current =
        true;

      void addFiles(
        initialFiles
      );
    },
    [
      initialFiles,
      addFiles,
    ]
  );


  /* ==========================================================================
     State
  ========================================================================== */

  const isBusy =
    isPreparing ||
    isSubmitting;


  /* ==========================================================================
     Back
  ========================================================================== */

  function handleBack() {
    if (
      isBusy
    ) {
      return;
    }

    onBack();
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
      {/* ====================================================================
          Navigation
      ==================================================================== */}

      <div
        className={
          styles.navigation
        }
      >
        <IconButton
          disabled={
            isBusy
          }
          onClick={
            handleBack
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


      {/* ====================================================================
          Preparing
      ==================================================================== */}

      {isPreparing && (
        <div
          className={
            styles.preparing
          }
          role="status"
        >
          <Loader2
            className={
              styles.loader
            }
            aria-hidden="true"
          />

          <span>
            {t(
              "preparing"
            )}
          </span>
        </div>
      )}


      {/* ====================================================================
          Composer
      ==================================================================== */}

      {!isPreparing &&
        activePhoto && (
        <>
          <PhotoUploadComposer
            previewUrl={
              activePhoto.previewUrl
            }
            description={
              activePhoto.description
            }
            descriptionPlaceholder={
              t(
                "descriptionPlaceholder"
              )
            }
            descriptionLabel={
              t(
                "descriptionLabel"
              )
            }
            removeLabel={
              t(
                "remove"
              )
            }
            disabled={
              isBusy
            }
            onDescriptionChange={
              setActivePhotoDescription
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


      {/* ====================================================================
          Error
      ==================================================================== */}

      {error && (
        <p
          role="alert"
          className={
            styles.error
          }
        >
          {error}
        </p>
      )}
    </div>
  );
}