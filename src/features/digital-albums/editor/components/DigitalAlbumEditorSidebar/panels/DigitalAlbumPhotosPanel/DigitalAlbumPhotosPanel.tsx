"use client";

import { ArrowLeft, Images, Plus } from "lucide-react";

import { useTranslations } from "next-intl";

import { useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";


import { Button } from "@/components/ui/button";


import { EmptyState } from "@/components/ui/empty-state/EmptyState";

import { addDigitalAlbumPhotosAction } from "@/features/digital-albums/actions/photos/addDigitalAlbumPhotosAction";


import DigitalAlbumAddPhotosDialog from "@/features/digital-albums/editor/components/DigitalAlbumAddPhotosDialog/DigitalAlbumAddPhotosDialog";

import type { DigitalAlbumPhotoWithPhoto } from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import { getEventPhotoUrl } from "@/features/event-photos/utils/getEventPhotoUrl";

import type { PhotoWall } from "@/features/photo-walls/types/photoWall.types";

import DigitalAlbumLibraryPhoto from "./DigitalAlbumLibraryPhoto";
import styles from "./DigitalAlbumPhotosPanel.module.css";

/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPhotosPanelProps {
  pageLabel?: string;
  onRequestDeletePhoto: (id: string) => void;
  albumId: string;

  photos: DigitalAlbumPhotoWithPhoto[];

  photoWalls: PhotoWall[];

  pickerTargetId: string | null;
  photoUsage: Record<string, number>;
  retainedPhotoIds: ReadonlySet<string>;
  onCancelPicker: () => void;

  selectedPhotoId: string | null;

  onSelectPhoto: (photoId: string) => void;

}

/* ==========================================================================
   Digital Album Photos Panel
========================================================================== */

export default function DigitalAlbumPhotosPanel({
  albumId,
  pageLabel,
  onRequestDeletePhoto,
  photos,
  photoWalls,
  pickerTargetId,
  photoUsage,
  retainedPhotoIds,
  onCancelPicker,
  selectedPhotoId,
  onSelectPhoto,
}: DigitalAlbumPhotosPanelProps) {
  /* ==========================================================================
     Router
  ========================================================================== */

  const router = useRouter();

  /* ==========================================================================
     Translations
  ========================================================================== */

  const t = useTranslations("DigitalAlbumEditor.photos");

  /* ==========================================================================
     State
  ========================================================================== */

  const [isAddPhotosOpen, setIsAddPhotosOpen] = useState(false);

  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // A page turn can return to the library. Only an explicit slot picker
    // should move focus; browsing must not steal it from the book controls.
    if (pickerTargetId === null) return;
    const button = panel.current?.querySelector<HTMLButtonElement>("button:not(:disabled)");
    if (!button?.getClientRects().length) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;
    button.focus({ preventScroll: true });
    button.scrollIntoView({ block: "nearest" });
  }, [pickerTargetId]);

  /* ==========================================================================
     Existing Photos
  ========================================================================== */

  const existingPhotoIds = photos.map((albumPhoto) => albumPhoto.photo_id);

  /* ==========================================================================
     Add From Photo Wall
  ========================================================================== */

  async function handleAddFromPhotoWall(photoIds: string[]) {
    const result = await addDigitalAlbumPhotosAction({
      albumId,
      photoIds,
    });

    if (!result.success) {
      throw new Error("Unable to add Photo Wall photos to album.");
    }

    router.refresh();
  }

  /* ==========================================================================
     Upload Success
  ========================================================================== */

  function handleUploadSuccess() {
    router.refresh();
  }

  /* ==========================================================================
     Remove Photo
  ========================================================================== */

  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <div ref={panel} className={styles.root}>
        <div className={styles.header} aria-live="polite">
          {pickerTargetId !== null && selectedPhotoId && <Button type="button" variant="ghost" onClick={onCancelPicker}>
            <ArrowLeft aria-hidden="true" />{t("backToPhoto")}
          </Button>}
          {pageLabel && <p className={styles.count}>{pageLabel}</p>}
          <p className={pickerTargetId !== null ? styles.context : styles.count}>{pickerTargetId !== null
            ? t(selectedPhotoId ? "replaceTitle" : "addTitle")
            : t("libraryCount", { count: photos.length, used: photos.filter((photo) => photoUsage[photo.photo_id]).length })}</p>
          {pickerTargetId !== null && <span className={styles.count}>{t(selectedPhotoId ? "replaceHelp" : "addHelp")}</span>}
        </div>
        {photos.length === 0 ? (
          <>
            <EmptyState
              icon={Images}
              title={t("empty.title")}
              description={t("empty.description")}
            />

            <Button
              type="button"
              className={styles.addButton}
              onClick={() => setIsAddPhotosOpen(true)}
            >
              <Plus aria-hidden="true" />

              {t("add")}
            </Button>
          </>
        ) : (
          <>
            <div className={styles.actions}>
              <Button
                type="button"
                variant="outline"
                className={styles.actionButton}
                onClick={() => setIsAddPhotosOpen(true)}
              >
                <Plus aria-hidden="true" />

                {t("add")}
              </Button>
            </div>

            <div className={styles.grid}>
              {photos.map((albumPhoto, index) => {
                const uses = photoUsage[albumPhoto.photo_id] ?? 0;
                const isUsed = uses > 0 || retainedPhotoIds.has(albumPhoto.photo_id);

                return (
                  <DigitalAlbumLibraryPhoto key={albumPhoto.photo_id}
                    selectable={pickerTargetId !== null} selected={selectedPhotoId === albumPhoto.photo_id}
                    isUsed={isUsed} imageUrl={getEventPhotoUrl(albumPhoto.photo.image_path)}
                    selectLabel={t("selectPhoto", { number: index + 1 }) + (uses ? ". " + t("usedTimes", { count: uses }) : "")}
                    deleteLabel={t("remove")}
                    usageBadge={uses ? (uses === 1 ? "\u2713" : `${uses}\u00d7`) : t("retainedBadge")}
                    onSelect={() => onSelectPhoto(albumPhoto.photo_id)}
                    onDelete={() => onRequestDeletePhoto(albumPhoto.photo_id)} />
                );
              })}
            </div>
          </>
        )}
      </div>

      <DigitalAlbumAddPhotosDialog
        open={isAddPhotosOpen}
        albumId={albumId}
        photoWalls={photoWalls}
        excludedPhotoIds={existingPhotoIds}
        onOpenChange={setIsAddPhotosOpen}
        onAddFromPhotoWall={handleAddFromPhotoWall}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
}
