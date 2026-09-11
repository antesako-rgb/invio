import Image
  from "next/image";

import type {
  ReactNode,
} from "react";

import "./PhotoWallPhotoCard.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallPhotoCardProps {
  imageUrl:
    string;

  alt?:
    string;

  width:
    number;

  height:
    number;

  primaryName:
    string | null;

  secondaryName:
    string | null;

  date:
    string | null;

  description?:
    string | null;

  photoAction?:
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
  imageUrl,
  alt = "",
  width,
  height,
  primaryName,
  secondaryName,
  date,
  description,
  photoAction,
  caption,
  onClick,
}: PhotoWallPhotoCardProps) {
  /* ==========================================================================
     Data
  ========================================================================== */

  const initials =
    [
      primaryName,
      secondaryName,
    ]
      .filter(
        (
          name
        ): name is string =>
          Boolean(
            name
          )
      )
      .map(
        (name) =>
          name
            .trim()
            .charAt(
              0
            )
            .toUpperCase()
      )
      .join(
        " · "
      );


  /* ==========================================================================
     Content
  ========================================================================== */

  const content = (
    <>
      <div
        className="photo-wall-photo-card__photo"
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
          className="photo-wall-photo-card__image"
        />


        {/* ==================================================================
            Photo Action
        ================================================================== */}

        {photoAction && (
          <div
            className="photo-wall-photo-card__photo-action"
          >
            {photoAction}
          </div>
        )}


        {/* ==================================================================
            Metadata
        ================================================================== */}

        {(initials ||
          date) && (
          <div
            className="photo-wall-photo-card__metadata"
          >
            {initials && (
              <span
                className="photo-wall-photo-card__initials"
              >
                {initials}
              </span>
            )}

            {date && (
              <span
                className="photo-wall-photo-card__date"
              >
                {date}
              </span>
            )}
          </div>
        )}
      </div>


      {/* ====================================================================
          Caption
      ==================================================================== */}

      {caption
        ? (
            <div
              className="photo-wall-photo-card__caption"
            >
              {caption}
            </div>
          )
        : description
          ? (
              <p
                className="photo-wall-photo-card__description"
              >
                {description}
              </p>
            )
          : null}
    </>
  );


  /* ==========================================================================
     Render
  ========================================================================== */

  return onClick
    ? (
        <button
          type="button"
          className="photo-wall-photo-card"
          onClick={
            onClick
          }
        >
          {content}
        </button>
      )
    : (
        <article
          className="photo-wall-photo-card"
        >
          {content}
        </article>
      );
}