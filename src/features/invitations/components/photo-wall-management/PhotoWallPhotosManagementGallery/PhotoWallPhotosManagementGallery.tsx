"use client";

import {
  useState,
} from "react";

import {
  Images,
  Star,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Button,
} from "@/components/ui/button";

import {
  EmptyState,
} from "@/components/ui/empty-state/EmptyState";

import TabsFilter
  from "@/components/ui/filter/TabsFilter";

import PhotoWallLightbox
  from "@/features/invitations/components/photo-wall-experience/PhotoWallLightbox/PhotoWallLightbox";

import PhotoWallPhotoCard
  from "@/features/invitations/components/photo-wall-experience/PhotoWallPhotoCard/PhotoWallPhotoCard";

import PhotoWallPhotoManagementActions
  from "@/features/invitations/components/photo-wall-management/PhotoWallPhotoManagementActions/PhotoWallPhotoManagementActions";

import {
  usePhotoWallPhotosManagement,
  type PhotoWallManagementGalleryPhoto,
} from "@/features/invitations/components/photo-wall-management/hooks/usePhotoWallPhotosManagement";

import type {
  PhotoWallPhotosCursor,
} from "@/features/invitations/types/photoWallPhoto.types";

import styles
  from "./PhotoWallPhotosManagementGallery.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallPhotosManagementGalleryProps {
  invitationId:
    string;

  photos:
    PhotoWallManagementGalleryPhoto[];

  nextCursor:
    PhotoWallPhotosCursor | null;

  totalCount:
    number;

  favoriteCount:
    number;
}


/* ==========================================================================
   Photo Wall Photos Management Gallery
========================================================================== */

export default function PhotoWallPhotosManagementGallery({
  invitationId,
  photos,
  nextCursor,
  totalCount,
  favoriteCount,
}: PhotoWallPhotosManagementGalleryProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperiences.management.photoWall.photos"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    selectedPhotoId,
    setSelectedPhotoId,
  ] =
    useState<string | null>(
      null
    );


  /* ==========================================================================
     Management
  ========================================================================== */

  const {
    filter,
    galleryPhotos,
    revealedPhotoIds,
    totalCount:
      currentTotalCount,
    favoriteCount:
      currentFavoriteCount,
    hasMore,
    pendingPhotoId,
    deletingPhotoId,
    isPending,
    isLoadingPage,
    handleFilterChange,
    handleLoadMore,
    handleFavoriteChange,
    handleDelete,
  } =
    usePhotoWallPhotosManagement({
      invitationId,

      photos,

      nextCursor,

      totalCount,

      favoriteCount,

      deleteSuccessMessage:
        t(
          "actions.deleteSuccess"
        ),
    });


  /* ==========================================================================
     Selected Photo
  ========================================================================== */

  const selectedPhoto =
    galleryPhotos.find(
      (photo) =>
        photo.id ===
        selectedPhotoId
    ) ??
    null;


  /* ==========================================================================
     Filters
  ========================================================================== */

  const filterItems = [
    {
      value:
        "all",

      label:
        t(
          "filters.all"
        ),

      count:
        currentTotalCount,
    },
    {
      value:
        "favorites",

      label:
        t(
          "filters.favorites"
        ),

      count:
        currentFavoriteCount,
    },
  ];


  /* ==========================================================================
     Photo Open
  ========================================================================== */

  function handlePhotoOpen(
    photoId:
      string
  ) {
    setSelectedPhotoId(
      photoId
    );
  }


  /* ==========================================================================
     Photo Close
  ========================================================================== */

  function handlePhotoClose() {
    setSelectedPhotoId(
      null
    );
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
      <TabsFilter
        items={
          filterItems
        }
        value={
          filter
        }
        onValueChange={
          handleFilterChange
        }
      />


      {/* ====================================================================
          Gallery
      ==================================================================== */}

      {galleryPhotos.length > 0
        ? (
            <>
              <ul
                className={
                  styles.gallery
                }
              >
                {galleryPhotos.map(
                  (photo) => (
                    <li
                      key={
                        photo.id
                      }
                      className={[
                        styles.item,

                        revealedPhotoIds.has(
                          photo.id
                        )
                          ? styles.itemReveal
                          : "",
                      ]
                        .filter(
                          Boolean
                        )
                        .join(
                          " "
                        )}
                    >
                      <div
                        className={
                          styles.thumbnail
                        }
                      >
                        <PhotoWallPhotoCard
                          imageUrl={
                            photo.imageUrl
                          }
                          alt={
                            photo.alt
                          }
                          width={
                            photo.width
                          }
                          height={
                            photo.height
                          }
                          description={
                            photo.description
                          }
                          onClick={() =>
                            handlePhotoOpen(
                              photo.id
                            )
                          }
                          photoAction={
                            <PhotoWallPhotoManagementActions
                              isFavorite={
                                photo.isFavorite
                              }
                              isFavoritePending={
                                isPending &&
                                pendingPhotoId ===
                                  photo.id
                              }
                              isDeleting={
                                deletingPhotoId ===
                                photo.id
                              }
                              onFavoriteChange={() =>
                                handleFavoriteChange(
                                  photo.id
                                )
                              }
                              onDelete={() =>
                                handleDelete(
                                  photo.id
                                )
                              }
                            />
                          }
                        />
                      </div>
                    </li>
                  )
                )}
              </ul>


              {/* ============================================================
                  Pagination
              ============================================================ */}

              {hasMore && (
                <div
                  className={
                    styles.pagination
                  }
                >
                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      isLoadingPage
                    }
                    onClick={
                      handleLoadMore
                    }
                  >
                    {isLoadingPage
                      ? t(
                          "pagination.loading"
                        )
                      : t(
                          "pagination.loadMore"
                        )}
                  </Button>
                </div>
              )}
            </>
          )
        : (
            <EmptyState
              icon={
                filter ===
                "favorites"
                  ? Star
                  : Images
              }
              title={
                filter ===
                "favorites"
                  ? t(
                      "emptyFavorites"
                    )
                  : t(
                      "empty"
                    )
              }
            />
          )}


      {/* ====================================================================
          Lightbox
      ==================================================================== */}

      <PhotoWallLightbox
        photo={
          selectedPhoto
        }
        onClose={
          handlePhotoClose
        }
        closeLabel={
          t(
            "lightbox.close"
          )
        }
        actions={
          selectedPhoto
            ? (
                <PhotoWallPhotoManagementActions
                  isFavorite={
                    selectedPhoto.isFavorite
                  }
                  isFavoritePending={
                    isPending &&
                    pendingPhotoId ===
                      selectedPhoto.id
                  }
                  isDeleting={
                    deletingPhotoId ===
                    selectedPhoto.id
                  }
                  onFavoriteChange={() =>
                    handleFavoriteChange(
                      selectedPhoto.id
                    )
                  }
                  onDelete={() =>
                    handleDelete(
                      selectedPhoto.id
                    )
                  }
                />
              )
            : undefined
        }
      />
    </div>
  );
}