"use client";

import {
  useEffect,
  useRef,
} from "react";

import PhotoWallPhotoCard
  from "@/features/invitations/components/photo-wall-experience/PhotoWallPhotoCard/PhotoWallPhotoCard";

import type {
  PhotoWallGalleryPhoto,
} from "@/features/invitations/types/photoWallPhoto.types";

import "./PhotoWallGallery.css";


/* ==========================================================================
   Constants
========================================================================== */

const DESKTOP_COLUMN_COUNT =
  3;


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallGalleryProps {
  photos:
    PhotoWallGalleryPhoto[];

  primaryName:
    string | null;

  secondaryName:
    string | null;

  date:
    string | null;

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
  primaryName,
  secondaryName,
  date,
  onPhotoClick,
}: PhotoWallGalleryProps) {
  /* ==========================================================================
     Refs
  ========================================================================== */

  const galleryRef =
    useRef<HTMLDivElement>(
      null
    );


  /* ==========================================================================
     Columns
  ========================================================================== */

  const columns =
    Array.from(
      {
        length:
          DESKTOP_COLUMN_COUNT,
      },
      () =>
        [] as PhotoWallGalleryPhoto[]
    );

  photos.forEach(
    (
      photo,
      index
    ) => {
      columns[
        index %
        DESKTOP_COLUMN_COUNT
      ].push(
        photo
      );
    }
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
          ".photo-wall-gallery__item"
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
     Render Photo
  ========================================================================== */

  function renderPhoto(
    photo:
      PhotoWallGalleryPhoto
  ) {
    return (
      <li
        key={
          photo.id
        }
        className="photo-wall-gallery__item"
      >
        <PhotoWallPhotoCard
          imageUrl={
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
          primaryName={
            primaryName
          }
          secondaryName={
            secondaryName
          }
          date={
            date
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
    );
  }


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
    <div
      ref={
        galleryRef
      }
      className="photo-wall-gallery"
    >
      {columns.map(
        (
          column,
          columnIndex
        ) => (
          <ul
            key={
              columnIndex
            }
            className="photo-wall-gallery__column"
          >
            {column.map(
              renderPhoto
            )}
          </ul>
        )
      )}
    </div>
  );
}