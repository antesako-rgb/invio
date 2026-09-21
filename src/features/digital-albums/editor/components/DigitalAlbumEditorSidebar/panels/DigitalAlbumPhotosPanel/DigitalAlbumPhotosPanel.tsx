"use client";

import {
  Images,
  Plus,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

import DeleteButton
  from "@/components/ui/common/DeleteButton";

import {
  EmptyState,
} from "@/components/ui/empty-state/EmptyState";

import {
  addDigitalAlbumPhotosAction,
} from "@/features/digital-albums/actions/photos/addDigitalAlbumPhotosAction";

import {
  removeDigitalAlbumPhotoAction,
} from "@/features/digital-albums/actions/photos/removeDigitalAlbumPhotoAction";

import DigitalAlbumAddPhotosDialog
  from "@/features/digital-albums/editor/components/DigitalAlbumAddPhotosDialog/DigitalAlbumAddPhotosDialog";

import type {
  DigitalAlbumPhoto,
  DigitalAlbumPhotoWithPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import {
  getEventPhotoUrl,
} from "@/features/event-photos/utils/getEventPhotoUrl";

import type {
  PhotoWall,
} from "@/features/invitations/types/photoWallPhoto.types";

import styles
  from "./DigitalAlbumPhotosPanel.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPhotosPanelProps {
  albumId:
    string;

  photos:
    DigitalAlbumPhotoWithPhoto[];

  photoWalls:
    PhotoWall[];

  activePageNumber:
    number | null;

  selectedPhotoId:
    string | null;

  onSelectPhoto:
    (
      photoId:
        string
    ) => void;

  onRemovePhotoFromPage:
    () => void;
}


/* ==========================================================================
   Digital Album Photos Panel
========================================================================== */

export default function DigitalAlbumPhotosPanel({
  albumId,
  photos,
  photoWalls,
  activePageNumber,
  selectedPhotoId,
  onSelectPhoto,
  onRemovePhotoFromPage,
}: DigitalAlbumPhotosPanelProps) {
  /* ==========================================================================
     Router
  ========================================================================== */

  const router =
    useRouter();


  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "DigitalAlbumEditor.photos"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isAddPhotosOpen,
    setIsAddPhotosOpen,
  ] =
    useState(
      false
    );

  const [
    removingPhotoId,
    setRemovingPhotoId,
  ] =
    useState<string | null>(
      null
    );


  /* ==========================================================================
     Existing Photos
  ========================================================================== */

  const existingPhotoIds =
    photos.map(
      (albumPhoto) =>
        albumPhoto.photo_id
    );


  /* ==========================================================================
     Add From Photo Wall
  ========================================================================== */

  async function handleAddFromPhotoWall(
    photoIds:
      string[]
  ) {
    const result =
      await addDigitalAlbumPhotosAction({
        albumId,
        photoIds,
      });

    if (
      !result.success
    ) {
      toast.error(
        result.message
      );

      throw new Error(
        result.message
      );
    }

    router.refresh();
  }


  /* ==========================================================================
     Upload Success
  ========================================================================== */

  function handleUploadSuccess(
    _photos:
      DigitalAlbumPhoto[]
  ) {
    router.refresh();
  }


  /* ==========================================================================
     Remove Photo
  ========================================================================== */

  async function handleRemovePhoto(
    photoId:
      string
  ) {
    if (
      removingPhotoId
    ) {
      return;
    }

    setRemovingPhotoId(
      photoId
    );

    const result =
      await removeDigitalAlbumPhotoAction({
        albumId,
        photoId,
      });

    if (
      !result.success
    ) {
      toast.error(
        t(
          "removeError"
        )
      );

      setRemovingPhotoId(
        null
      );

      return;
    }

    toast.success(
      t(
        "removeSuccess"
      )
    );

    router.refresh();

    setRemovingPhotoId(
      null
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <div
        className={
          styles.root
        }
      >
        {photos.length === 0
          ? (
              <>
                <EmptyState
                  icon={
                    Images
                  }
                  title={
                    t(
                      "empty.title"
                    )
                  }
                  description={
                    t(
                      "empty.description"
                    )
                  }
                />

                <Button
                  type="button"
                  className={
                    styles.addButton
                  }
                  onClick={
                    () =>
                      setIsAddPhotosOpen(
                        true
                      )
                  }
                >
                  <Plus
                    aria-hidden="true"
                  />

                  {t(
                    "add"
                  )}
                </Button>
              </>
            )
          : (
              <>
                <div
                  className={
                    styles.header
                  }
                >
                  {activePageNumber !==
                    null && (
                    <p
                      className={
                        styles.context
                      }
                    >
                      {t(
                        selectedPhotoId
                          ? "changeForPage"
                          : "selectForPage",
                        {
                          number:
                            activePageNumber,
                        }
                      )}
                    </p>
                  )}

                  <span
                    className={
                      styles.count
                    }
                  >
                    {t(
                      "count",
                      {
                        count:
                          photos.length,
                      }
                    )}
                  </span>
                </div>

<div
  className={
    styles.actions
  }
>
  {selectedPhotoId && (
    <Button
      type="button"
      variant="outline"
      className={
        styles.actionButton
      }
      onClick={
        onRemovePhotoFromPage
      }
    >
      {t(
        "removeFromPage"
      )}
    </Button>
  )}

  <Button
    type="button"
    variant="outline"
    className={
      styles.actionButton
    }
    onClick={
      () =>
        setIsAddPhotosOpen(
          true
        )
    }
  >
    <Plus
      aria-hidden="true"
    />

    {t(
      "add"
    )}
  </Button>
</div>

                <div
                  className={
                    styles.grid
                  }
                >
                  {photos.map(
                    (albumPhoto) => {
                      const isRemoving =
                        removingPhotoId ===
                        albumPhoto.photo_id;

                      return (
                        <div
                          key={
                            albumPhoto.photo_id
                          }
                          className={
                            styles.photo
                          }
                        >
                          <button
                            type="button"
                            className={
                              styles.selectButton
                            }
                            data-selected={
                              selectedPhotoId ===
                              albumPhoto.photo_id
                            }
                            onClick={
                              () =>
                                onSelectPhoto(
                                  albumPhoto.photo_id
                                )
                            }
                          >
                            <img
                              src={
                                getEventPhotoUrl(
                                  albumPhoto.photo.image_path
                                )
                              }
                              alt=""
                              className={
                                styles.image
                              }
                            />
                          </button>

                          <div
                            className={
                              styles.removeButton
                            }
                          >
                            <DeleteButton
                              display="icon"
                              ariaLabel={
                                t(
                                  "remove"
                                )
                              }
                              title={
                                t(
                                  "removeConfirm.title"
                                )
                              }
                              description={
                                t(
                                  "removeConfirm.description"
                                )
                              }
                              confirmText={
                                t(
                                  "removeConfirm.confirm"
                                )
                              }
                              loading={
                                isRemoving
                              }
                              onDelete={
                                () =>
                                  handleRemovePhoto(
                                    albumPhoto.photo_id
                                  )
                              }
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            )}
      </div>

      <DigitalAlbumAddPhotosDialog
        open={
          isAddPhotosOpen
        }
        albumId={
          albumId
        }
        photoWalls={
          photoWalls
        }
        excludedPhotoIds={
          existingPhotoIds
        }
        onOpenChange={
          setIsAddPhotosOpen
        }
        onAddFromPhotoWall={
          handleAddFromPhotoWall
        }
        onUploadSuccess={
          handleUploadSuccess
        }
      />
    </>
  );
}