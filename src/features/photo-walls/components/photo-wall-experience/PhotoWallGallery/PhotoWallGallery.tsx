"use client";

import { useTranslations } from "next-intl";

import {
  useEffect,
  useRef,
} from "react";

import PhotoWallPhotoCard
  from "@/features/photo-walls/components/photo-wall-experience/PhotoWallPhotoCard/PhotoWallPhotoCard";

import type {
  PhotoWallGalleryPhoto,
} from "@/features/photo-walls/types/photoWallPhoto.types";

import styles from "./PhotoWallGallery.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallGalleryProps {
  photos:
    PhotoWallGalleryPhoto[];

  onPhotoClick?:
    (
      photo:
        PhotoWallGalleryPhoto
    ) => void;
}


/* ==========================================================================
   Photo Wall Gallery
========================================================================== */

export default function PhotoWallGallery({
  photos,
  onPhotoClick,
}: PhotoWallGalleryProps) {

  const t = useTranslations("PhotoWalls.photoWall.gallery");

  /* ==========================================================================
     Refs
  ========================================================================== */

  const galleryRef =
    useRef<HTMLUListElement>(
      null
    );


  /* ==========================================================================
     Reveal
  ========================================================================== */

  useEffect(
    () => {
      const gallery =
        galleryRef.current;

      if (
        !gallery
      ) {
        return;
      }

      const items =
        gallery.querySelectorAll<HTMLElement>(
          `.${styles.item}`
        );

      const prefersReducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

      if (
        prefersReducedMotion
      ) {
        items.forEach(
          (item) => {
            item.dataset.visible =
              "true";
          }
        );

        return;
      }

      const observer =
        new IntersectionObserver(
          (entries) => {
            entries.forEach(
              (entry) => {
                if (
                  !entry.isIntersecting
                ) {
                  return;
                }

                const item =
                  entry.target as HTMLElement;

                item.dataset.visible =
                  "true";

                observer.unobserve(
                  item
                );
              }
            );
          },
          {
            rootMargin:
              "0px 0px 80px 0px",

            threshold:
              0.08,
          }
        );

      items.forEach(
        (item) => {
          if (
            item.dataset.visible ===
            "true"
          ) {
            return;
          }

          observer.observe(
            item
          );
        }
      );

      return () => {
        observer.disconnect();
      };
    },
    [
      photos,
    ]
  );


  /* ==========================================================================
     Render
  ========================================================================== */

  if (
    photos.length ===
    0
  ) {
    return null;
  }

  return (
    <ul
      ref={
        galleryRef
      }
      className={styles.gallery}
    >
      {photos.map(
        (photo, index) => (
          <li
            key={
              photo.id
            }
            className={styles.item}
          >
            <PhotoWallPhotoCard
              variant="public"
              imageUrl={
                photo.imageUrl
              }
              alt={
                photo.alt || photo.description || t("photoLabel", { number: index + 1 })
              }
              width={
                photo.width
              }
              height={
                photo.height
              }
              description={
                photo.description
              }
              onClick={
                onPhotoClick
                  ? () =>
                      onPhotoClick(
                        photo
                      )
                  : undefined
              }
            />
          </li>
        )
      )}
    </ul>
  );
}
