"use client";

import { ArrowLeft } from "lucide-react";

import { useTranslations } from "next-intl";

import { useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";


import { Button } from "@/components/ui/button";


import EditorPhotoLibrary from "@/features/editor/components/EditorPhotoLibrary/EditorPhotoLibrary";

import { addDigitalAlbumPhotosAction } from "@/features/digital-albums/actions/photos/addDigitalAlbumPhotosAction";


import DigitalAlbumAddPhotosDialog from "@/features/digital-albums/editor/components/DigitalAlbumAddPhotosDialog/DigitalAlbumAddPhotosDialog";

import type { DigitalAlbumPhotoWithPhoto } from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import { getProjectPhotoUrl } from "@/features/project-photos/utils/getProjectPhotoUrl";

import type { PhotoWall } from "@/features/photo-walls/types/photoWall.types";

import EditorPhotoDescription from "@/features/editor/components/EditorPhotoDescription/EditorPhotoDescription";
import EditorLibraryPhoto from "@/features/editor/components/EditorPhotoLibrary/EditorLibraryPhoto";
import styles from "./DigitalAlbumPhotosPanel.module.css";

/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPhotosPanelProps {
  onDescriptionSave: (id: string, value: string) => Promise<void>;
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
  onDescriptionSave,
  albumId,
  pageLabel,
  onRequestDeletePhoto,
  photos,
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
     Add Existing Project Photos
  ========================================================================== */

  async function handleAddExisting(photoIds: string[]) {
    const result = await addDigitalAlbumPhotosAction({
      albumId,
      photoIds,
    });

    if (!result.success) {
      throw new Error("Unable to add project photos to album.");
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
      <div ref={panel}>
      <EditorPhotoLibrary picking={pickerTargetId !== null} addLabel={t("add")} empty={photos.length === 0} emptyLabel={t("empty.description")}
        onAdd={() => setIsAddPhotosOpen(true)} header={<>
          {pickerTargetId !== null && selectedPhotoId && <Button type="button" variant="ghost" onClick={onCancelPicker}>
            <ArrowLeft aria-hidden="true" />{t("backToPhoto")}
          </Button>}
          {pageLabel && <p className={styles.count}>{pageLabel}</p>}
          <p className={pickerTargetId !== null ? styles.context : styles.count}>{pickerTargetId !== null
            ? t(selectedPhotoId ? "replaceTitle" : "addTitle")
            : t("libraryCount", { count: photos.length, used: photos.filter((photo) => photoUsage[photo.photo_id]).length })}</p>
          {pickerTargetId !== null && <span className={styles.count}>{t(selectedPhotoId ? "replaceHelp" : "addHelp")}</span>}
        </>}>
              {photos.map((albumPhoto, index) => {
                const uses = photoUsage[albumPhoto.photo_id] ?? 0;
                const isUsed = uses > 0 || retainedPhotoIds.has(albumPhoto.photo_id);

                return (
                  <EditorLibraryPhoto key={albumPhoto.photo_id}
                    descriptionControl={pickerTargetId === null && <EditorPhotoDescription compact value={albumPhoto.description} onSave={value => onDescriptionSave(albumPhoto.photo_id, value)} />}
                    selectable={pickerTargetId !== null} selected={selectedPhotoId === albumPhoto.photo_id}
                    isUsed={isUsed} imageUrl={getProjectPhotoUrl(albumPhoto.photo.image_path)}
                    selectLabel={t("selectPhoto", { number: index + 1 }) + (uses ? ". " + t("usedTimes", { count: uses }) : "")}
                    deleteLabel={t("remove")}
                    usageBadge={uses ? (uses === 1 ? "\u2713" : `${uses}\u00d7`) : t("retainedBadge")}
                    onSelect={() => onSelectPhoto(albumPhoto.photo_id)}
                    onDelete={() => onRequestDeletePhoto(albumPhoto.photo_id)} />
                );
              })}

      </EditorPhotoLibrary>
      </div>

      <DigitalAlbumAddPhotosDialog
        open={isAddPhotosOpen}
        albumId={albumId}
        excludedPhotoIds={existingPhotoIds}
        onOpenChange={setIsAddPhotosOpen}
        onAddExisting={handleAddExisting}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
}
