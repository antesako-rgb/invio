"use client";

import {
  useTranslations,
} from "next-intl";

import PhotoUploadComposer
  from "@/features/photo-upload/components/PhotoUploadComposer/PhotoUploadComposer";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallPhotoComposerProps {
  previewUrl:
    string;

  description:
    string;

  onDescriptionChange:
    (
      value:
        string
    ) => void;

  onRemove?:
    () => void;
}


/* ==========================================================================
   Photo Wall Photo Composer
========================================================================== */

export default function PhotoWallPhotoComposer({
  previewUrl,
  description,
  onDescriptionChange,
  onRemove,
}: PhotoWallPhotoComposerProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperiences.photoWall.composer"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <PhotoUploadComposer
      previewUrl={
        previewUrl
      }
      description={
        description
      }
      descriptionPlaceholder={
        t(
          "descriptionPlaceholder"
        )
      }
      descriptionLabel={
        t(
          "descriptionLabel"
        )
      }
      removeLabel={
        t(
          "remove"
        )
      }
      onDescriptionChange={
        onDescriptionChange
      }
      onRemove={
        onRemove
      }
    />
  );
}