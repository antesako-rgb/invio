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
} from "@/features/digital-albums/editor/hooks/useDigitalAlbumPhotoPicker";

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

  isAdding?:
    boolean;

  onCancel:
    () => void;

  onAdd:
    (
      photoIds: string[]
    ) => void;
}


/* ==========================================================================
   Digital Album Photo Picker
========================================================================== */

export default function DigitalAlbumPhotoPicker({
  photoWallId,
  excludedPhotoIds,
  isAdding = false,
  onCancel,
  onAdd,
}: DigitalAlbumPhotoPickerProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

const t =
  useTranslations(
    "DigitalAlbumEditor.photos.picker"
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
     Status
  ========================================================================== */

  const isInitialLoading =
    isLoadingPage &&
    galleryPhotos.length === 0;

  const isBusy =
    isLoadingPage ||
    isAdding;


  /* ==========================================================================
     Add
  ========================================================================== */

  function handleAdd() {
    if (
      selectedCount === 0 ||
      isBusy
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
     Photo Toggle
  ========================================================================== */

  function handleToggle(
    photoId:
      string
  ) {
    if (
      isBusy
    ) {
      return;
    }

    handlePhotoToggle(
      photoId
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
          isBusy
            ? () => {}
            : handleFilterChange
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
                        disabled={
                          isBusy
                        }
                        onClick={
                          () =>
                            handleToggle(
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
              isBusy
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
            isBusy
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
            isBusy
          }
          onClick={
            handleAdd
          }
        >
          {isAdding
            ? t(
                "actions.adding"
              )
            : t(
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