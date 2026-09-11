import PhotoWallPhotoCard
  from "@/features/invitations/components/photo-wall-experience/PhotoWallPhotoCard/PhotoWallPhotoCard";

import "./PhotoWallGallery.css";


/* ==========================================================================
   Types
========================================================================== */

export interface PhotoWallGalleryPhoto {
  id:
    string;

  imageUrl:
    string;

  alt:
    string;

  width:
    number;

  height:
    number;

  description:
    string | null;
}

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
  if (
    photos.length ===
    0
  ) {
    return null;
  }


  /* ========================================================================
     Render
  ======================================================================== */

  return (
    <ul
      className="photo-wall-gallery"
    >
      {photos.map(
        (photo) => (
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
        )
      )}
    </ul>
  );
}