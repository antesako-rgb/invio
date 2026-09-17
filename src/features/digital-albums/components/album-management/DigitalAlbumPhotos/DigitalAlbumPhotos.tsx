"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Images,
  Plus,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  toast,
} from "sonner";

import {
  useRouter,
} from "@/i18n/navigation";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";

import {
  EmptyState,
} from "@/components/ui/empty-state/EmptyState";

import {
  addDigitalAlbumPhotosAction,
} from "@/features/digital-albums/actions/photos/addDigitalAlbumPhotosAction";

import DigitalAlbumPhotoPicker
  from "@/features/digital-albums/components/album-management/DigitalAlbumPhotoPicker/DigitalAlbumPhotoPicker";

import type {
  DigitalAlbumPhotoWithPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import styles
  from "./DigitalAlbumPhotos.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPhotosProps {
  albumId:
    string;

  photoWallId:
    string;

  photos:
    DigitalAlbumPhotoWithPhoto[];
}


/* ==========================================================================
   Digital Album Photos
========================================================================== */

export default function DigitalAlbumPhotos({
  albumId,
  photoWallId,
  photos,
}: DigitalAlbumPhotosProps) {
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
      "DigitalAlbums.management.photos"
    );


  /* ==========================================================================
     Existing Photos
  ========================================================================== */

  const existingPhotoIds =
    useMemo(
      () =>
        photos.map(
          (albumPhoto) =>
            albumPhoto.photo_id
        ),
      [
        photos,
      ]
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isPickerOpen,
    setIsPickerOpen,
  ] =
    useState(
      false
    );

  const [
    isAddingPhotos,
    setIsAddingPhotos,
  ] =
    useState(
      false
    );


  /* ==========================================================================
     Add Photos
  ========================================================================== */

  function handleAddPhotos() {
    setIsPickerOpen(
      true
    );
  }


  /* ==========================================================================
     Add Selected Photos
  ========================================================================== */

  async function handleAddSelectedPhotos(
    photoIds:
      string[]
  ) {
    if (
      photoIds.length === 0 ||
      isAddingPhotos
    ) {
      return;
    }

    setIsAddingPhotos(
      true
    );

    try {
      const result =
        await addDigitalAlbumPhotosAction({
          albumId,
          photoIds,
        });

      if (!result.success) {
        toast.error(
          result.message
        );

        return;
      }

      setIsPickerOpen(
        false
      );

      router.refresh();
    } catch (error) {
      console.error(
        "addDigitalAlbumPhotos error:",
        error
      );

      toast.error(
        t(
          "picker.error"
        )
      );
    } finally {
      setIsAddingPhotos(
        false
      );
    }
  }


  /* ==========================================================================
     Picker Open Change
  ========================================================================== */

  function handlePickerOpenChange(
    open:
      boolean
  ) {
    if (
      isAddingPhotos
    ) {
      return;
    }

    setIsPickerOpen(
      open
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <section
        className={
          styles.root
        }
      >
        {/* ==================================================================
            Header
        ================================================================== */}

        <div
          className={
            styles.header
          }
        >
          <div
            className={
              styles.headerContent
            }
          >
            <h2
              className={
                styles.title
              }
            >
              {t(
                "title"
              )}
            </h2>

            <p
              className={
                styles.description
              }
            >
              {t(
                "description"
              )}
            </p>
          </div>

          <Button
            type="button"
            onClick={
              handleAddPhotos
            }
          >
            <Plus
              aria-hidden="true"
            />

            {t(
              "actions.add"
            )}
          </Button>
        </div>


        {/* ==================================================================
            Content
        ================================================================== */}

        {photos.length === 0
          ? (
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
                action={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={
                      handleAddPhotos
                    }
                  >
                    <Plus
                      aria-hidden="true"
                    />

                    {t(
                      "actions.add"
                    )}
                  </Button>
                }
              />
            )
          : (
              <div>
                {photos.length} fotografija
              </div>
            )}
      </section>


      {/* ====================================================================
          Photo Picker
      ==================================================================== */}

      <Dialog
        open={
          isPickerOpen
        }
        onOpenChange={
          handlePickerOpenChange
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t(
                "picker.title"
              )}
            </DialogTitle>

            <DialogDescription>
              {t(
                "picker.description"
              )}
            </DialogDescription>
          </DialogHeader>

          {isPickerOpen && (
            <DigitalAlbumPhotoPicker
              photoWallId={
                photoWallId
              }
              excludedPhotoIds={
                existingPhotoIds
              }
              onCancel={
                () =>
                  handlePickerOpenChange(
                    false
                  )
              }
              onAdd={
                handleAddSelectedPhotos
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}