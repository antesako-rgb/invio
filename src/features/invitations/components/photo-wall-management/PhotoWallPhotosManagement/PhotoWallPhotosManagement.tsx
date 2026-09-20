import {
  getTranslations,
} from "next-intl/server";

import PhotoWallPhotosManagementGallery
  from "@/features/invitations/components/photo-wall-management/PhotoWallPhotosManagementGallery/PhotoWallPhotosManagementGallery";

import {
  buildPhotoWallGalleryPhotos,
} from "@/features/invitations/renderer/data/buildPhotoWallGalleryPhotos";

import type {
  PhotoWallPhotosPage,
} from "@/features/invitations/types/photoWallPhoto.types";

import styles
  from "./PhotoWallPhotosManagement.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallPhotosManagementProps {
  invitationId:
    string;

  photosPage:
    PhotoWallPhotosPage;
}


/* ==========================================================================
   Photo Wall Photos Management
========================================================================== */

export default async function PhotoWallPhotosManagement({
  invitationId,
  photosPage,
}: PhotoWallPhotosManagementProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    await getTranslations(
      "EventExperiences.management.photoWall.photos"
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

      <PhotoWallPhotosManagementGallery
        invitationId={
          invitationId
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