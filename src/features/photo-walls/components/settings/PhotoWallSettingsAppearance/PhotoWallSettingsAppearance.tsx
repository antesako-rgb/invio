"use client";
import { useActionError } from "@/lib/actions/useActionError";

import {
  useState,
  useTransition,
} from "react";

import {
  useTranslations,
} from "next-intl";


import {
  updatePhotoWallAction,
} from "@/features/photo-walls/actions/photos-wall/updatePhotoWallAction";

import PhotoWallColorPicker
  from "@/features/photo-walls/components/settings/PhotoWallColorPicker/PhotoWallColorPicker";

import type {
  PhotoWall,
  PhotoWallColor,
} from "@/features/photo-walls/types/photoWall.types";


/* ==========================================================================
   Constants
========================================================================== */

const DEFAULT_PHOTO_WALL_COLOR:
  PhotoWallColor =
    "memiva";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallSettingsAppearanceProps {
  photoWall:
    PhotoWall;
}


/* ==========================================================================
   Appearance
========================================================================== */

function getPhotoWallColor(
  appearance:
    PhotoWall["appearance"]
): PhotoWallColor {
  if (
    typeof appearance !== "object" ||
    appearance === null ||
    Array.isArray(
      appearance
    )
  ) {
    return DEFAULT_PHOTO_WALL_COLOR;
  }

  const color =
    appearance.color;

  if (
    color === "memiva" ||
    color === "warm" ||
    color === "sage" ||
    color === "rose" ||
    color === "blue" ||
    color === "lavender" ||
    color === "charcoal"
  ) {
    return color;
  }

  return DEFAULT_PHOTO_WALL_COLOR;
}


/* ==========================================================================
   Photo Wall Settings Appearance
========================================================================== */

export default function PhotoWallSettingsAppearance({
  photoWall,
}: PhotoWallSettingsAppearanceProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const actionError = useActionError();
  const t =
     useTranslations(
    "PhotoWalls.management.settings.appearance"
  );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    color,
    setColor,
  ] =
    useState<PhotoWallColor>(
      () =>
        getPhotoWallColor(
          photoWall.appearance
        )
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    isPending,
    startTransition,
  ] =
    useTransition();


  /* ==========================================================================
     Color Change
  ========================================================================== */

  function handleColorChange(
    nextColor:
      PhotoWallColor
  ) {
    if (
      nextColor === color ||
      isPending
    ) {
      return;
    }

    const previousColor =
      color;

    setColor(
      nextColor
    );

    setError(
      null
    );

    startTransition(
      async () => {
        const result =
          await updatePhotoWallAction({
            p_photo_wall_id:
              photoWall.id,

            p_name:
              photoWall.name,

            p_appearance: {
              color:
                nextColor,
            },
          });

        if (
          !result.success
        ) {
          setColor(
            previousColor
          );

          setError(
            actionError(result.code)
          );

          return;
        }

        setColor(
          getPhotoWallColor(
            result.data.appearance
          )
        );
      }
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <section
      className="photo-wall-settings-appearance"
    >
      <PhotoWallColorPicker
        value={
          color
        }
        onChange={
          handleColorChange
        }
        disabled={
          isPending
        }
      />

      {error && (
        <p
          className="photo-wall-settings-appearance__error"
          role="alert"
        >
          {t(
            "error"
          )}
        </p>
      )}
    </section>
  );
}