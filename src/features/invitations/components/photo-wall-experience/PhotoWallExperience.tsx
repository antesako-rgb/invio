"use client";

import {
  useState,
} from "react";

import {
  ArrowLeft,
  ImagePlus,
  Images,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  EmptyState,
} from "@/components/ui/empty-state/EmptyState";

import PhotoWallGallery
  from "@/features/invitations/components/photo-wall-experience/PhotoWallGallery/PhotoWallGallery";

import {
  usePublicPhotoWallPhotos,
} from "@/features/invitations/components/photo-wall-experience/hooks/usePublicPhotoWallPhotos";

import PhotoWallLightbox
  from "@/features/invitations/components/photo-wall-experience/PhotoWallLightbox/PhotoWallLightbox";

import PhotoWallUpload
  from "@/features/invitations/components/photo-wall-experience/PhotoWallUpload/PhotoWallUpload";

import type {
  PhotoWallGalleryPhoto,
  PhotoWallPhoto,
  PhotoWallPhotosCursor,
} from "@/features/invitations/types/photoWallPhoto.types";

import "./PhotoWallExperience.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallExperienceProps {
  publicId:
    string | null;

  primaryName:
    string | null;

  secondaryName:
    string | null;

  date:
    string | null;

  photos:
    PhotoWallGalleryPhoto[];

  nextCursor?:
    PhotoWallPhotosCursor | null;

  onBack?:
    () => void;
}


/* ==========================================================================
   Photo Wall Experience
========================================================================== */

export default function PhotoWallExperience({
  publicId,
  primaryName,
  secondaryName,
  date,
  photos: initialPhotos,
  nextCursor: initialNextCursor = null,
  onBack,
}: PhotoWallExperienceProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperiences.photoWall"
    );


  /* ==========================================================================
     Photo Wall Photos
  ========================================================================== */

  const {
    photos,
    hasMore,
    isLoading,
    error,
    loadMore,
    prependPhotos,
  } =
    usePublicPhotoWallPhotos({
      publicId,

      initialPhotos,

      initialNextCursor,
    });


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isUploadOpen,
    setIsUploadOpen,
  ] =
    useState(
      false
    );

  const [
    selectedPhoto,
    setSelectedPhoto,
  ] =
    useState<PhotoWallGalleryPhoto | null>(
      null
    );


  /* ==========================================================================
     Data
  ========================================================================== */

  const hasPhotos =
    photos.length >
    0;


  /* ==========================================================================
     Lightbox
  ========================================================================== */

  function handlePhotoClick(
    photo:
      PhotoWallGalleryPhoto
  ) {
    setSelectedPhoto(
      photo
    );
  }


  function handleLightboxClose() {
    setSelectedPhoto(
      null
    );
  }


  /* ==========================================================================
     Upload
  ========================================================================== */

  function handleAddPhotos() {
    if (
      !publicId
    ) {
      return;
    }

    setIsUploadOpen(
      true
    );
  }


  function handleUploadOpenChange(
    open:
      boolean
  ) {
    setIsUploadOpen(
      open
    );
  }


  function handleUploadSuccess(
    uploadedPhotos:
      PhotoWallPhoto[]
  ) {
    setIsUploadOpen(
      false
    );

    prependPhotos(
      uploadedPhotos
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <section
        className="photo-wall-experience"
        data-photo-wall-experience
      >
        {/* ==================================================================
            Navigation
        ================================================================== */}

        {onBack && (
          <button
            type="button"
            className="photo-wall-experience__back"
            onClick={
              onBack
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
        )}


        {/* ==================================================================
            Header
        ================================================================== */}

        <header
          className="photo-wall-experience__header"
        >
          <div
            className="photo-wall-experience__intro"
          >
            <h1
              className="photo-wall-experience__title"
            >
              {t(
                "gallery.title"
              )}
            </h1>

            <p
              className="photo-wall-experience__description"
            >
              {t(
                "gallery.description"
              )}
            </p>
          </div>

          {hasPhotos && (
            <button
              type="button"
              className="photo-wall-experience__add"
              onClick={
                handleAddPhotos
              }
            >
              <ImagePlus
                aria-hidden="true"
              />

              {t(
                "actions.addPhotos"
              )}
            </button>
          )}
        </header>


        {/* ==================================================================
            Photos
        ================================================================== */}

        {hasPhotos
          ? (
              <>
                <p
                  className="photo-wall-experience__count"
                >
                  {t(
                    "gallery.count",
                    {
                      count:
                        photos.length,
                    }
                  )}
                </p>

                <PhotoWallGallery
                  photos={
                    photos
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
                  onPhotoClick={
                    handlePhotoClick
                  }
                />


                {/* ==========================================================
                    Load More
                ========================================================== */}

                {hasMore && (
                  <div
                    className="photo-wall-experience__load-more"
                  >
                    <button
                      type="button"
                      className="photo-wall-experience__load-more-button"
                      onClick={
                        loadMore
                      }
                      disabled={
                        isLoading
                      }
                    >
                      {isLoading
                        ? t(
                            "gallery.loadingMore"
                          )
                        : t(
                            "gallery.loadMore"
                          )}
                    </button>
                  </div>
                )}


                {/* ==========================================================
                    Error
                ========================================================== */}

                {error && (
                  <p
                    className="photo-wall-experience__error"
                    role="status"
                  >
                    {error}
                  </p>
                )}
              </>
            )
          : (
              <EmptyState
                icon={
                  Images
                }
                title={
                  t(
                    "gallery.empty"
                  )
                }
                description={
                  t(
                    "gallery.emptyDescription"
                  )
                }
                action={
                  <button
                    type="button"
                    className="photo-wall-experience__add"
                    onClick={
                      handleAddPhotos
                    }
                  >
                    <ImagePlus
                      aria-hidden="true"
                    />

                    {t(
                      "actions.addPhotos"
                    )}
                  </button>
                }
              />
            )}
      </section>


      {/* ====================================================================
          Photo Wall Lightbox
      ==================================================================== */}

      <PhotoWallLightbox
        photo={
          selectedPhoto
        }
        onClose={
          handleLightboxClose
        }
        closeLabel={
          t(
            "gallery.closePhoto"
          )
        }
      />


      {/* ====================================================================
          Photo Wall Upload
      ==================================================================== */}

      {publicId && (
        <PhotoWallUpload
          open={
            isUploadOpen
          }
          publicId={
            publicId
          }
          onOpenChange={
            handleUploadOpenChange
          }
          onSuccess={
            handleUploadSuccess
          }
        />
      )}
    </>
  );
}