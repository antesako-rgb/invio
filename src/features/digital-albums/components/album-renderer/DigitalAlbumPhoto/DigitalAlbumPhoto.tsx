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
  getEventPhotoUrl,
} from "@/features/event-photos/utils/getEventPhotoUrl";

import type {
  DigitalAlbumPhotoSlot as Slot,
} from "../../../types/digitalAlbumDocument.types";

import {
  digitalAlbumPhotoStyle,
} from "../../../utils/digitalAlbumPhotoStyle";

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
            getEventPhotoUrl(
              photo.imagePath
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
            digitalAlbumPhotoStyle(
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

      {photo &&
        failed ===
          photo.imagePath && (
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