"use client";


import "../../styles/photoWallTokens.css";


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

import {
  PHOTO_WALL_UPLOAD_ENABLED,
} from "@/features/photo-walls/config/photoWallCapabilities";

import {
  usePublicPhotoWallPhotos,
} from "@/features/photo-walls/components/photo-wall-experience/hooks/usePublicPhotoWallPhotos";

import PhotoWallHeroSlideshow
  from "./PhotoWallHeroSlideshow/PhotoWallHeroSlideshow";

import PhotoWallGallery
  from "@/features/photo-walls/components/photo-wall-experience/PhotoWallGallery/PhotoWallGallery";

import PhotoWallLightbox
  from "@/features/photo-walls/components/photo-wall-experience/PhotoWallLightbox/PhotoWallLightbox";

import PhotoWallUpload
  from "@/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/PhotoWallUpload";

import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  PhotoWallGalleryPhoto,
  PhotoWallPhoto,
  PhotoWallPhotosCursor,
} from "@/features/photo-walls/types/photoWallPhoto.types";

import styles from "./PhotoWallExperience.module.css";


/* ==========================================================================
   Constants
========================================================================== */

const DEFAULT_PHOTO_WALL_COLOR =
  "memiva";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallExperienceProps {
  publicId:
    string | null;

  eventName:
    string | null;

  date:
    string | null;

  appearance:
    Json;

  photos:
    PhotoWallGalleryPhoto[];

  nextCursor?:
    PhotoWallPhotosCursor | null;

  onBack?:
    () => void;
}


/* ==========================================================================
   Appearance
========================================================================== */

function getPhotoWallColor(
  appearance:
    Json
) {
  if (
    typeof appearance !== "object" ||
    appearance === null ||
    Array.isArray(
      appearance
    )
  ) {
    return DEFAULT_PHOTO_WALL_COLOR;
  }

  const color =
    appearance.color;

  if (
    typeof color !== "string" ||
    !color.trim()
  ) {
    return DEFAULT_PHOTO_WALL_COLOR;
  }

  return color.trim();
}


/* ==========================================================================
   Photo Wall Experience
========================================================================== */

export default function PhotoWallExperience({
  publicId,
  eventName,
  date,
  appearance,
  photos: initialPhotos,
  nextCursor: initialNextCursor = null,
  onBack,
}: PhotoWallExperienceProps) {

  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "PhotoWalls.photoWall"
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

  const canUpload =
    Boolean(
      publicId &&
      PHOTO_WALL_UPLOAD_ENABLED
    );

  const color =
    getPhotoWallColor(
      appearance
    );


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
      !canUpload
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
        className={styles.experience}
        data-photo-wall-experience
        data-color={
          color
        }
      >
        {/* ==================================================================
            Hero
        ================================================================== */}

        <header
          className={styles.hero}
        >
          {onBack && (
            <button
              type="button"
              className={styles.back}
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

          <div
            className={styles.heroContent}
          >
            {eventName && (
              <h1
                className={styles.eventName}
              >
                {eventName}
              </h1>
            )}

            {date && (
              <p
                className={styles.date}
              >
                {date}
              </p>
            )}

            {hasPhotos && (
              <PhotoWallHeroSlideshow photos={photos} className={styles.slideshow} />
            )}

            <div
              className={styles.intro}
            >
              <h2
                className={styles.title}
              >
                {t(
                  "gallery.title"
                )}
              </h2>

              <p
                className={styles.description}
              >
                {t(
                  "gallery.description"
                )}
              </p>
            </div>

            {canUpload && (
              <button
                type="button"
                className={styles.add}
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
          </div>
        </header>


        {/* ==================================================================
            Photos
        ================================================================== */}

        <div
          className={styles.content}
        >
          {hasPhotos
            ? (
                <>
                  <p
                    className={styles.count}
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
                    onPhotoClick={
                      handlePhotoClick
                    }
                  />

                  {hasMore && (
                    <div
                      className={styles.loadMore}
                    >
                      <button
                        type="button"
                        className={styles.loadMoreButton}
                        onClick={
                          loadMore
                        }
                        disabled={
                          isLoading
                        }
                        aria-busy={isLoading}
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

                  {error && (
                    <p
                      className={styles.error}
                      role="status"
                    >
                      {error}
                    </p>
                  )}
                </>
              )
            : (
                <EmptyState
                  className={styles.empty}
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

                />
              )}
        </div>
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

  {publicId && canUpload && (
  <PhotoWallUpload
    open={
      isUploadOpen
    }
    publicId={
      publicId
    }
    color={
      color
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
