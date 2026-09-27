import {
  getTranslations,
} from "next-intl/server";

import PhotoWallPhotosManagementGallery
  from "@/features/photo-walls/components/photo-wall-management/PhotoWallPhotosManagementGallery/PhotoWallPhotosManagementGallery";

import {
  buildPhotoWallGalleryPhotos,
} from "@/features/photo-walls/renderer/data/buildPhotoWallGalleryPhotos";

import type {
  PhotoWallPhotosPage,
} from "@/features/photo-walls/types/photoWallPhoto.types";

import styles
  from "./PhotoWallPhotosManagement.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallPhotosManagementProps {
  photoWallId:
    string;

  photosPage:
    PhotoWallPhotosPage;
}


/* ==========================================================================
   Photo Wall Photos Management
========================================================================== */

export default async function PhotoWallPhotosManagement({
  photoWallId,
  photosPage,
}: PhotoWallPhotosManagementProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const unavailable = await getTranslations("PhotoWalls.photoWall");
  const t =
    await getTranslations(
      "PhotoWalls.management.photoWall.photos"
    );


  /* ==========================================================================
     Photos
  ========================================================================== */

  const {
    photos,
    nextCursor,
    totalCount,
    favoriteCount,
  } =
    photosPage;


  /* ==========================================================================
     Gallery Photos
  ========================================================================== */

  const galleryPhotos =
    buildPhotoWallGalleryPhotos(
      photos
    );

  const managementPhotos =
    galleryPhotos.map(
      (
        photo,
        index
      ) => ({
        ...photo,

        isFavorite:
          photos[
            index
          ].isFavorite,
      })
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <section
      className={
        styles.section
      }
    >
      <div
        className={
          styles.header
        }
      >
        <div
          className={
            styles.heading
          }
        >
          <h2
            className={
              styles.title
            }
          >
            {t(
              "title"
            )}
          </h2>

          <p
            className={
              styles.description
            }
          >
            {t(
              "description"
            )}
          </p>
        </div>
      </div>


      {/* ====================================================================
          Photos
      ==================================================================== */}

      <p className={styles.description}>{unavailable("deleteUnavailable")}</p>
      <PhotoWallPhotosManagementGallery
        photoWallId={
          photoWallId
        }
        photos={
          managementPhotos
        }
        nextCursor={
          nextCursor
        }
        totalCount={
          totalCount
        }
        favoriteCount={
          favoriteCount
        }
      />
    </section>
  );
}