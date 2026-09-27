import Image
  from "next/image";

import type {
  ReactNode,
} from "react";

import styles from "./PhotoWallPhotoCard.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallPhotoCardProps {
  variant?: "default" | "public" | "management";
  imageUrl:
    string;

  alt?:
    string;

  width:
    number;

  height:
    number;

  description?:
    string | null;

  photoAction?:
    ReactNode;

  photoBottomAction?:
    ReactNode;

  caption?:
    ReactNode;

  onClick?:
    () => void;
}


/* ==========================================================================
   Photo Wall Photo Card
========================================================================== */

export default function PhotoWallPhotoCard({
  variant = "default",
  imageUrl,
  alt = "",
  width,
  height,
  description,
  photoAction,
  photoBottomAction,
  caption,
  onClick,
}: PhotoWallPhotoCardProps) {

  /* ==========================================================================
     Photo
  ========================================================================== */

  const photo = (
    <div
      className={styles.photo}
    >
      <Image
        src={
          imageUrl
        }
        alt={
          alt
        }
        width={
          width
        }
        height={
          height
        }
        sizes="
          (max-width: 767px) 50vw,
          (max-width: 1199px) 33vw,
          320px
        "
        unoptimized={
          imageUrl.startsWith(
            "blob:"
          )
        }
        className={styles.image}
      />

      {photoBottomAction && (
        <div
          className={styles.photoBottomAction}
        >
          {photoBottomAction}
        </div>
      )}
    </div>
  );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <article
      className={styles.card}
      data-variant={variant}
    >
      {onClick
        ? (
            <button
              type="button"
              className={styles.trigger}
              onClick={
                onClick
              }
            >
              {photo}
            </button>
          )
        : photo}

      {photoAction && (
        <div
          className={styles.photoAction}
        >
          {photoAction}
        </div>
      )}

      {caption
        ? (
            <div
              className={styles.caption}
            >
              {caption}
            </div>
          )
        : description
          ? (
              <p
                className={styles.description}
              >
                {description}
              </p>
            )
          : null}
    </article>
  );
}