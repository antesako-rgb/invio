"use client";

import {
  Check,
  Images,
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

import Loader
  from "@/components/ui/loader/Loader";

import {
  useDigitalAlbumPhotoPicker,
} from "@/features/digital-albums/hooks/useDigitalAlbumPhotoPicker";

import styles
  from "./DigitalAlbumPhotoPicker.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPhotoPickerProps {
  photoWallId:
    string;

  excludedPhotoIds?:
    string[];

  onCancel:
    () => void;

  onAdd:
    (photoIds: string[]) => void;
}


/* ==========================================================================
   Digital Album Photo Picker
========================================================================== */

export default function DigitalAlbumPhotoPicker({
  photoWallId,
  excludedPhotoIds,
  onCancel,
  onAdd,
}: DigitalAlbumPhotoPickerProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "DigitalAlbums.management.photos.picker"
    );


  /* ==========================================================================
     Picker
  ========================================================================== */

  const {
    filter,

    galleryPhotos,

    selectedPhotoIds,

    selectedCount,

    totalCount:
      currentTotalCount,

    favoriteCount:
      currentFavoriteCount,

    hasMore,

    isLoadingPage,

    handleFilterChange,

    handleLoadMore,

    handlePhotoToggle,
  } =
    useDigitalAlbumPhotoPicker({
      photoWallId,
      excludedPhotoIds,
    });


  /* ==========================================================================
     Loading
  ========================================================================== */

  const isInitialLoading =
    isLoadingPage &&
    galleryPhotos.length === 0;


  /* ==========================================================================
     Add
  ========================================================================== */

  function handleAdd() {
    if (
      selectedCount === 0
    ) {
      return;
    }

    onAdd(
      Array.from(
        selectedPhotoIds
      )
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
      {/* ====================================================================
          Filters
      ==================================================================== */}

      <TabsFilter
        value={
          filter
        }
        onValueChange={
          handleFilterChange
        }
        items={[
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
        ]}
      />


      {/* ====================================================================
          Photos
      ==================================================================== */}

      {isInitialLoading
        ? (
            <Loader
              label={
                t(
                  "loading"
                )
              }
            />
          )
        : galleryPhotos.length === 0
          ? (
              <EmptyState
                icon={
                  Images
                }
                title={
                  filter === "favorites"
                    ? t(
                        "empty.favorites.title"
                      )
                    : t(
                        "empty.all.title"
                      )
                }
                description={
                  filter === "favorites"
                    ? t(
                        "empty.favorites.description"
                      )
                    : t(
                        "empty.all.description"
                      )
                }
              />
            )
          : (
              <div
                className={
                  styles.grid
                }
              >
                {galleryPhotos.map(
                  (photo) => {
                    const isSelected =
                      selectedPhotoIds.has(
                        photo.id
                      );

                    return (
                      <button
                        key={
                          photo.id
                        }
                        type="button"
                        className={
                          styles.photo
                        }
                        data-selected={
                          isSelected
                            ? "true"
                            : "false"
                        }
                        aria-pressed={
                          isSelected
                        }
                        onClick={
                          () =>
                            handlePhotoToggle(
                              photo.id
                            )
                        }
                      >
                        <img
                          src={
                            photo.imageUrl
                          }
                          alt={
                            photo.alt
                          }
                          className={
                            styles.image
                          }
                        />

                        <span
                          className={
                            styles.selection
                          }
                          aria-hidden="true"
                        >
                          {isSelected && (
                            <Check />
                          )}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            )}


      {/* ====================================================================
          Load More
      ==================================================================== */}

      {hasMore && (
        <div
          className={
            styles.loadMore
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
            {t(
              "actions.loadMore"
            )}
          </Button>
        </div>
      )}


      {/* ====================================================================
          Actions
      ==================================================================== */}

      <div
        className={
          styles.actions
        }
      >
        <Button
          type="button"
          variant="outline"
          disabled={
            isLoadingPage
          }
          onClick={
            onCancel
          }
        >
          {t(
            "actions.cancel"
          )}
        </Button>

        <Button
          type="button"
          disabled={
            selectedCount === 0 ||
            isLoadingPage
          }
          onClick={
            handleAdd
          }
        >
          {t(
            "actions.add",
            {
              count:
                selectedCount,
            }
          )}
        </Button>
      </div>
    </div>
  );
}