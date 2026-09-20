"use client";

import {
  useCallback,
  useState,
} from "react";

import {
  loadPublicPhotoWallPhotosAction,
} from "@/features/invitations/actions/photo-wall/loadPublicPhotoWallPhotosAction";

import {
  buildPhotoWallGalleryPhotos,
} from "@/features/invitations/renderer/data/buildPhotoWallGalleryPhotos";

import type {
  PhotoWallGalleryPhoto,
  PhotoWallPhoto,
  PhotoWallPhotosCursor,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Types
========================================================================== */

interface UsePublicPhotoWallPhotosInput {
  publicId:
    string | null;

  initialPhotos:
    PhotoWallGalleryPhoto[];

  initialNextCursor:
    PhotoWallPhotosCursor | null;
}

interface UsePublicPhotoWallPhotosResult {
  photos:
    PhotoWallGalleryPhoto[];

  hasMore:
    boolean;

  isLoading:
    boolean;

  error:
    string | null;

  loadMore:
    () => Promise<void>;

  prependPhotos:
    (
      photos:
        PhotoWallPhoto[]
    ) => void;
}


/* ==========================================================================
   Use Public Photo Wall Photos
========================================================================== */

export function usePublicPhotoWallPhotos({
  publicId,
  initialPhotos,
  initialNextCursor,
}: UsePublicPhotoWallPhotosInput): UsePublicPhotoWallPhotosResult {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    photos,
    setPhotos,
  ] =
    useState<PhotoWallGalleryPhoto[]>(
      initialPhotos
    );

  const [
    nextCursor,
    setNextCursor,
  ] =
    useState<PhotoWallPhotosCursor | null>(
      initialNextCursor
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(
      false
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );


  /* ==========================================================================
     Load More
  ========================================================================== */

  const loadMore =
    useCallback(
      async () => {
        if (
          !publicId ||
          !nextCursor ||
          isLoading
        ) {
          return;
        }

        setIsLoading(
          true
        );

        setError(
          null
        );

        try {
          const page =
            await loadPublicPhotoWallPhotosAction({
              publicId,

              cursor:
                nextCursor,
            });

          const nextPhotos =
            buildPhotoWallGalleryPhotos(
              page.photos
            );

          setPhotos(
            currentPhotos => {
              const existingIds =
                new Set(
                  currentPhotos.map(
                    photo =>
                      photo.id
                  )
                );

              const uniqueNextPhotos =
                nextPhotos.filter(
                  photo =>
                    !existingIds.has(
                      photo.id
                    )
                );

              return [
                ...currentPhotos,
                ...uniqueNextPhotos,
              ];
            }
          );

          setNextCursor(
            page.nextCursor
          );
        } catch (
          loadError
        ) {
          console.error(
            "loadPublicPhotoWallPhotos error:",
            loadError
          );

          setError(
            "Fotografije nije moguće dohvatiti."
          );
        } finally {
          setIsLoading(
            false
          );
        }
      },
      [
        publicId,
        nextCursor,
        isLoading,
      ]
    );


  /* ==========================================================================
     Prepend Photos
  ========================================================================== */

  const prependPhotos =
    useCallback(
      (
        uploadedPhotos:
          PhotoWallPhoto[]
      ) => {
        const sortedPhotos =
          [
            ...uploadedPhotos,
          ].sort(
            (
              firstPhoto,
              secondPhoto
            ) =>
             secondPhoto.createdAt.localeCompare(
  firstPhoto.createdAt
)
          );

        const nextPhotos =
          buildPhotoWallGalleryPhotos(
            sortedPhotos
          );

        setPhotos(
          currentPhotos => {
            const uploadedIds =
              new Set(
                nextPhotos.map(
                  photo =>
                    photo.id
                )
              );

            const remainingPhotos =
              currentPhotos.filter(
                photo =>
                  !uploadedIds.has(
                    photo.id
                  )
              );

            return [
              ...nextPhotos,
              ...remainingPhotos,
            ];
          }
        );
      },
      []
    );


  /* ==========================================================================
     Result
  ========================================================================== */

  return {
    photos,

    hasMore:
      nextCursor !==
      null,

    isLoading,

    error,

    loadMore,

    prependPhotos,
  };
}