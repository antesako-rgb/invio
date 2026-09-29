"use client";

import {
  useState,
} from "react";

import Image
  from "next/image";

import {
  useTranslations,
} from "next-intl";

import {
  getDigitalAlbumPhotoUrl,
} from "../utils/getDigitalAlbumPhotoUrl";

import type {
  DigitalAlbumPhotoSlot as Slot,
} from "../../../types/digitalAlbumDocument.types";

import {
  editorPhotoStyle,
} from "@/features/editor/utils/editorPhotoStyle";

import DigitalAlbumPhotoSlot
  from "../DigitalAlbumPhotoSlot/DigitalAlbumPhotoSlot";

import type {
  DigitalAlbumRendererPhoto,
} from "../types/digitalAlbumRenderer.types";

import styles
  from "./DigitalAlbumPhoto.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPhotoProps {
  showPlaceholder?: boolean;
  slot:
    Slot;

  photo?:
    DigitalAlbumRendererPhoto;

  active?:
    boolean;

  onSelect?:
    (id: string) => void;
}


/* ==========================================================================
   Digital Album Photo
========================================================================== */

export default function DigitalAlbumPhoto({
  slot,
  photo,
  active,
  showPlaceholder,
  onSelect,
}: DigitalAlbumPhotoProps) {
  const t =
    useTranslations(
      "DigitalAlbumEditor.upgrade"
    );

  const [
    failed,
    setFailed,
  ] =
    useState<string | null>(
      null
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <DigitalAlbumPhotoSlot
      showPlaceholder={showPlaceholder}
      missing={Boolean(slot.photoId && !photo)}
      slotId={
        slot.id
      }
      active={
        active
      }
      editable={
        Boolean(onSelect)
      }
      empty={
        !photo
      }
      onSelect={
        onSelect
      }
    >
      {photo && (
        <Image
          src={
            getDigitalAlbumPhotoUrl(
              photo
            )
          }
          alt={
            slot.caption ??
            photo.description ??
            ""
          }
          fill
          sizes="(max-width: 768px) 100vw, 440px"
          style={
            editorPhotoStyle(
              slot
            )
          }
          onError={() =>
            setFailed(
              photo.imagePath
            )
          }
        />
      )}

      {onSelect && ((slot.photoId && !photo) || (photo && failed === photo.imagePath)) && (
          <span
            className={
              styles.error
            }
            role="alert"
          >
            {t(
              "photoError"
            )}
          </span>
        )}
    </DigitalAlbumPhotoSlot>
  );
}
