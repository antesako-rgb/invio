"use client";

import { toast } from "sonner";

import { Images, Upload } from "lucide-react";

import { useTranslations } from "next-intl";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";

import FilePicker from "@/components/ui/file-picker/FilePicker";

import DigitalAlbumPhotoPicker from "@/features/digital-albums/editor/components/DigitalAlbumPhotoPicker/DigitalAlbumPhotoPicker";

import DigitalAlbumUpload from "@/features/digital-albums/editor/components/DigitalAlbumUpload/DigitalAlbumUpload";

import type { DigitalAlbumPhoto } from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import type { PhotoWall } from "@/features/invitations/types/photoWallPhoto.types";

import PhotoUploadDialog from "@/features/photo-upload/components/PhotoUploadDialog/PhotoUploadDialog";

import PhotoUploadSource from "@/features/photo-upload/components/PhotoUploadSource/PhotoUploadSource";

import { ACCEPTED_IMAGE_TYPES_VALUE } from "@/features/photo-upload/constants/photoUpload.constants";

import styles from "./DigitalAlbumAddPhotosDialog.module.css";

/* ==========================================================================
   Types
========================================================================== */

type DigitalAlbumAddPhotosStep =
  | "source"
  | "upload"
  | "photo-wall-select"
  | "photo-wall-picker";

interface DigitalAlbumAddPhotosDialogProps {
  open: boolean;

  albumId: string;

  photoWalls: PhotoWall[];

  excludedPhotoIds?: string[];

  onOpenChange: (open: boolean) => void;

  onAddFromPhotoWall: (photoIds: string[]) => Promise<void>;

  onUploadSuccess: (photos: DigitalAlbumPhoto[]) => void;
}

/* ==========================================================================
   Digital Album Add Photos Dialog
========================================================================== */

export default function DigitalAlbumAddPhotosDialog({
  open,
  albumId,
  photoWalls,
  excludedPhotoIds,
  onOpenChange,
  onAddFromPhotoWall,
  onUploadSuccess,
}: DigitalAlbumAddPhotosDialogProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t = useTranslations("DigitalAlbumEditor.photos.addDialog");

  /* ==========================================================================
     State
  ========================================================================== */

  const [step, setStep] = useState<DigitalAlbumAddPhotosStep>("source");

  const [initialFiles, setInitialFiles] = useState<File[]>([]);

  const [selectedPhotoWallId, setSelectedPhotoWallId] = useState<string | null>(
    null,
  );

  const [uploadBusy, setUploadBusy] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const addLock = useRef(false);

  /* ==========================================================================
     Reset
  ========================================================================== */

  function resetDialog() {
    setStep("source");

    setInitialFiles([]);

    setSelectedPhotoWallId(null);
  }

  /* ==========================================================================
     Open Change
  ========================================================================== */

  function handleOpenChange(nextOpen: boolean) {
    if (addLock.current || isAdding || uploadBusy) {
      return;
    }

    if (!nextOpen) {
      resetDialog();
    }

    onOpenChange(nextOpen);
  }

  /* ==========================================================================
     Upload
  ========================================================================== */

  function handleUploadFiles(files: File[]) {
    if (isAdding || files.length === 0) {
      return;
    }

    setInitialFiles(files);

    setStep("upload");
  }

  function handleUploadBack() {
    if (addLock.current || isAdding || uploadBusy) {
      return;
    }

    setInitialFiles([]);

    setStep("source");
  }

  function handleUploadSuccess(photos: DigitalAlbumPhoto[]) {
    onUploadSuccess(photos);

    resetDialog();

    onOpenChange(false);
  }

  /* ==========================================================================
     Photo Wall
  ========================================================================== */

  function handlePhotoWall() {
    if (isAdding || photoWalls.length === 0) {
      return;
    }

    if (photoWalls.length === 1) {
      setSelectedPhotoWallId(photoWalls[0].id);

      setStep("photo-wall-picker");

      return;
    }

    setStep("photo-wall-select");
  }

  /* ==========================================================================
     Select Photo Wall
  ========================================================================== */

  function handlePhotoWallSelect(photoWallId: string) {
    if (addLock.current || isAdding || uploadBusy) {
      return;
    }

    setSelectedPhotoWallId(photoWallId);

    setStep("photo-wall-picker");
  }

  /* ==========================================================================
     Add From Photo Wall
  ========================================================================== */

  async function handleAddFromPhotoWall(photoIds: string[]) {
    if (addLock.current || isAdding || uploadBusy) {
      return;
    }

    addLock.current = true;
    setIsAdding(true);

    try {
      await onAddFromPhotoWall(photoIds);

      resetDialog();

      onOpenChange(false);
    } catch {
      toast.error(t("addError"));
    } finally {
      addLock.current = false;
      setIsAdding(false);
    }
  }

  /* ==========================================================================
     Back
  ========================================================================== */

  function handleBackFromPhotoWallSelect() {
    if (addLock.current || isAdding || uploadBusy) {
      return;
    }

    setStep("source");
  }

  function handleBackFromPhotoWallPicker() {
    if (addLock.current || isAdding || uploadBusy) {
      return;
    }

    setSelectedPhotoWallId(null);

    if (photoWalls.length > 1) {
      setStep("photo-wall-select");

      return;
    }

    setStep("source");
  }

  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <PhotoUploadDialog
      open={open}
      onOpenChange={handleOpenChange}
      closeLabel={t("actions.close")}
      disabled={isAdding || uploadBusy}
    >
      {/* ====================================================================
          Source
      ==================================================================== */}

      {step === "source" && (
        <FilePicker
          accept={ACCEPTED_IMAGE_TYPES_VALUE}
          multiple
          onSelect={handleUploadFiles}
        >
          {(openGallery) => (
            <PhotoUploadSource
              title={t("title")}
              description={t("description")}
              actions={[
                {
                  id: "upload",

                  icon: <Upload aria-hidden="true" />,

                  title: t("sources.upload"),

                  description: t("sources.uploadDescription"),

                  onClick: openGallery,
                },

                ...(photoWalls.length > 0
                  ? [
                      {
                        id: "photo-wall",

                        icon: <Images aria-hidden="true" />,

                        title: t("sources.photoWall"),

                        description: t("sources.photoWallDescription"),

                        onClick: handlePhotoWall,
                      },
                    ]
                  : []),
              ]}
              disabled={isAdding}
            />
          )}
        </FilePicker>
      )}

      {/* ====================================================================
          Upload
      ==================================================================== */}

      {step === "upload" && initialFiles.length > 0 && (
        <DigitalAlbumUpload
          onBusyChange={setUploadBusy}
          onProgress={onUploadSuccess}
          albumId={albumId}
          initialFiles={initialFiles}
          onBack={handleUploadBack}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* ====================================================================
          Photo Wall Select
      ==================================================================== */}

      {step === "photo-wall-select" && (
        <>
          <DialogHeader>
            <DialogTitle>{t("photoWallSelect.title")}</DialogTitle>

            <DialogDescription>
              {t("photoWallSelect.description")}
            </DialogDescription>
          </DialogHeader>

          <div className={styles.photoWallList}>
            {photoWalls.map((photoWall) => (
              <Button
                key={photoWall.id}
                type="button"
                variant="outline"
                className={styles.photoWall}
                disabled={isAdding}
                onClick={() => handlePhotoWallSelect(photoWall.id)}
              >
                <Images aria-hidden="true" />

                {photoWall.name}
              </Button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className={styles.back}
            disabled={isAdding}
            onClick={handleBackFromPhotoWallSelect}
          >
            {t("actions.back")}
          </Button>
        </>
      )}

      {/* ====================================================================
          Photo Wall Picker
      ==================================================================== */}

      {step === "photo-wall-picker" && selectedPhotoWallId && (
        <>
          <DialogHeader>
            <DialogTitle>{t("photoWall.title")}</DialogTitle>

            <DialogDescription>{t("photoWall.description")}</DialogDescription>
          </DialogHeader>

          <DigitalAlbumPhotoPicker
            photoWallId={selectedPhotoWallId}
            excludedPhotoIds={excludedPhotoIds}
            isAdding={isAdding}
            onCancel={handleBackFromPhotoWallPicker}
            onAdd={handleAddFromPhotoWall}
          />
        </>
      )}
    </PhotoUploadDialog>
  );
}
