"use client";

import { useTranslations } from "next-intl";

import type {
  ReactNode,
} from "react";

import {
  Dialog as DialogPrimitive,
} from "@base-ui/react/dialog";

import {
  X,
} from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog/dialog";

import type {
  PhotoWallGalleryPhoto,
} from "@/features/photo-walls/types/photoWallPhoto.types";

import styles from "./PhotoWallLightbox.module.css";
import PhotoWallLightboxActions from "./PhotoWallLightboxActions";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallLightboxProps {
  allowDownload?: boolean;
  allowShare?: boolean;
  photo:
    PhotoWallGalleryPhoto | null;

  onClose:
    () => void;

  closeLabel:
    string;

  actions?:
    ReactNode;
}


/* ==========================================================================
   Photo Wall Lightbox
========================================================================== */

export default function PhotoWallLightbox({
  photo,
  onClose,
  closeLabel,
  actions,
  allowDownload = true,
  allowShare = true,
}: PhotoWallLightboxProps) {
  const t = useTranslations("PhotoWalls.photoWall.gallery");
  /* ==========================================================================
     Open Change
  ========================================================================== */

  function handleOpenChange(
    open:
      boolean
  ) {
    if (
      !open
    ) {
      onClose();
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Dialog
      open={
        photo !==
        null
      }
      onOpenChange={
        handleOpenChange
      }
    >
      {photo && (
        <DialogPortal>
          <DialogOverlay
            className={styles.overlay}
          />

          <DialogPrimitive.Popup
            className={styles.lightbox}
            data-photo-wall-lightbox
          >
            <DialogPrimitive.Title
              className={styles.srOnly}
            >
              {photo.alt || photo.description || t("photoTitle")}
            </DialogPrimitive.Title>

            <div
              className={styles.content}
            >
              <div
                className={styles.media}
              >
                <img
                  src={
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
                  className={styles.image}
                />

                <DialogClose
                  className={styles.close}
                  aria-label={
                    closeLabel
                  }
                >
                  <X
                    aria-hidden="true"
                  />
                </DialogClose>

                {actions && (
                  <div
                    className={styles.actions}
                  >
                    {actions}
                  </div>
                )}

                {photo.description && (
                  <div
                    className={styles.caption}
                  >
                    <p
                      className={styles.description}
                    >
                      {photo.description}
                    </p>
                  </div>
                )}
              </div>
              {(allowDownload || allowShare) && (
                <PhotoWallLightboxActions
                  key={`${photo.id}:${photo.imageUrl}`}
                  photo={photo}
                  allowDownload={allowDownload}
                  allowShare={allowShare}
                />
              )}
            </div>
          </DialogPrimitive.Popup>
        </DialogPortal>
      )}
    </Dialog>
  );
}
