"use client";

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
} from "@/features/invitations/types/photoWallPhoto.types";

import "./PhotoWallLightbox.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallLightboxProps {
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
}: PhotoWallLightboxProps) {
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
            className="photo-wall-lightbox__overlay"
          />

          <DialogPrimitive.Popup
            className="photo-wall-lightbox"
            data-photo-wall-lightbox
          >
            <DialogPrimitive.Title
              className="photo-wall-lightbox__sr-only"
            >
              {photo.alt}
            </DialogPrimitive.Title>

            <div
              className="photo-wall-lightbox__content"
            >
              <div
                className="photo-wall-lightbox__media"
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
                  className="photo-wall-lightbox__image"
                />

                <DialogClose
                  className="photo-wall-lightbox__close"
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
                    className="photo-wall-lightbox__actions"
                  >
                    {actions}
                  </div>
                )}

                {photo.description && (
                  <div
                    className="photo-wall-lightbox__caption"
                  >
                    <p
                      className="photo-wall-lightbox__description"
                    >
                      {photo.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DialogPrimitive.Popup>
        </DialogPortal>
      )}
    </Dialog>
  );
}