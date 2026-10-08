"use client";

import {
  Camera,
  Images,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import PhotoUploadSource
  from "@/features/project-photos/upload/components/PhotoUploadSource/PhotoUploadSource";

import styles from "./PhotoWallUploadSource.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallUploadSourceProps {
  onCamera:
    () => void;

  onGallery:
    () => void;

  disabled?:
    boolean;
}


/* ==========================================================================
   Photo Wall Upload Source
========================================================================== */

export default function PhotoWallUploadSource({
  onCamera,
  onGallery,
  disabled = false,
}: PhotoWallUploadSourceProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "PhotoWalls.photoWall.upload.source"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={styles.source}
    >
      <PhotoUploadSource
        variant="cards"
        title={
          t(
            "title"
          )
        }
        description={
          t(
            "description"
          )
        }
        actions={[
          {
            id:
              "camera",

            icon:
              <Camera
                aria-hidden="true"
              />,

            title:
              t(
                "camera.title"
              ),

            description:
              t(
                "camera.description"
              ),

            onClick:
              onCamera,
          },
          {
            id:
              "gallery",

            icon:
              <Images
                aria-hidden="true"
              />,

            title:
              t(
                "gallery.title"
              ),

            description:
              t(
                "gallery.description"
              ),

            onClick:
              onGallery,
          },
        ]}
        disabled={
          disabled
        }
      />
    </div>
  );
}