import {
  useState,
  useTransition,
} from "react";

import {
  toast,
} from "sonner";

import {
  deletePhotoWallPhotoAction,
} from "@/features/invitations/actions/photo-wall/deletePhotoWallPhotoAction";

import {
  getPhotoWallPhotosPageAction,
} from "@/features/invitations/actions/photo-wall/getPhotoWallPhotosPageAction";

import {
  setPhotoWallPhotoFavoriteAction,
} from "@/features/invitations/actions/photo-wall/setPhotoWallPhotoFavoriteAction";

import {
  buildPhotoWallGalleryPhotos,
} from "@/features/invitations/renderer/data/buildPhotoWallGalleryPhotos";

import type {
  PhotoWallGalleryPhoto,
  PhotoWallPhoto,
  PhotoWallPhotosCursor,
  PhotoWallPhotosManagementFilter,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Types
========================================================================== */

export interface PhotoWallManagementGalleryPhoto
  extends PhotoWallGalleryPhoto {
  isFavorite:
    boolean;
}


interface UsePhotoWallPhotosManagementInput {
  invitationId:
    string;

  photos:
    PhotoWallManagementGalleryPhoto[];

  nextCursor:
    PhotoWallPhotosCursor | null;

  totalCount:
    number;

  favoriteCount:
    number;

  deleteSuccessMessage:
    string;
}


/* ==========================================================================
   Use Photo Wall Photos Management
========================================================================== */

export function usePhotoWallPhotosManagement({
  invitationId,
  photos,
  nextCursor,
  totalCount,
  favoriteCount,
  deleteSuccessMessage,
}: UsePhotoWallPhotosManagementInput) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    filter,
    setFilter,
  ] =
    useState<PhotoWallPhotosManagementFilter>(
      "all"
    );

  const [
    galleryPhotos,
    setGalleryPhotos,
  ] =
    useState(
      photos
    );

  const [
    currentCursor,
    setCurrentCursor,
  ] =
    useState<PhotoWallPhotosCursor | null>(
      nextCursor
    );

  const [
    currentTotalCount,
    setCurrentTotalCount,
  ] =
    useState(
      totalCount
    );

  const [
    currentFavoriteCount,
    setCurrentFavoriteCount,
  ] =
    useState(
      favoriteCount
    );

  const [
    revealedPhotoIds,
    setRevealedPhotoIds,
  ] =
    useState<Set<string>>(
      new Set()
    );

  const [
    pendingPhotoId,
    setPendingPhotoId,
  ] =
    useState<string | null>(
      null
    );

  const [
    deletingPhotoId,
    setDeletingPhotoId,
  ] =
    useState<string | null>(
      null
    );

  const [
    isLoadingPage,
    setIsLoadingPage,
  ] =
    useState(
      false
    );

  const [
    isPending,
    startTransition,
  ] =
    useTransition();


  /* ==========================================================================
     Map Photos
  ========================================================================== */

  function mapPhotos(
    pagePhotos:
      PhotoWallPhoto[]
  ): PhotoWallManagementGalleryPhoto[] {
    const galleryPagePhotos =
      buildPhotoWallGalleryPhotos(
        pagePhotos
      );

    return galleryPagePhotos.map(
      (
        photo,
        index
      ) => ({
        id:
          photo.id,

        imageUrl:
          photo.imageUrl,

        alt:
          photo.alt,

        width:
          photo.width,

        height:
          photo.height,

        description:
          photo.description,

        isFavorite:
          pagePhotos[
            index
          ].is_favorite,
      })
    );
  }


  /* ==========================================================================
     Filter Change
  ========================================================================== */

  async function handleFilterChange(
    value:
      string
  ) {
    if (
      value !== "all" &&
      value !== "favorites"
    ) {
      return;
    }

    if (
      value === filter ||
      isLoadingPage ||
      isPending ||
      deletingPhotoId
    ) {
      return;
    }

    setIsLoadingPage(
      true
    );

    try {
      const result =
        await getPhotoWallPhotosPageAction({
          invitationId,

          filter:
            value,
        });

      if (
        !result.success
      ) {
        toast.error(
          result.message
        );

        return;
      }

      setFilter(
        value
      );

      setGalleryPhotos(
        mapPhotos(
          result.data.photos
        )
      );

      setRevealedPhotoIds(
        new Set()
      );

      setCurrentCursor(
        result.data.nextCursor
      );

      setCurrentTotalCount(
        result.data.totalCount
      );

      setCurrentFavoriteCount(
        result.data.favoriteCount
      );
    } finally {
      setIsLoadingPage(
        false
      );
    }
  }


  /* ==========================================================================
     Load More
  ========================================================================== */

  async function handleLoadMore() {
    if (
      !currentCursor ||
      isLoadingPage ||
      isPending ||
      deletingPhotoId
    ) {
      return;
    }

    setIsLoadingPage(
      true
    );

    try {
      const result =
        await getPhotoWallPhotosPageAction({
          invitationId,

          filter,

          cursor:
            currentCursor,
        });

      if (
        !result.success
      ) {
        toast.error(
          result.message
        );

        return;
      }

      const nextPhotos =
        mapPhotos(
          result.data.photos
        );

      setRevealedPhotoIds(
        new Set(
          nextPhotos.map(
            (photo) =>
              photo.id
          )
        )
      );

      setGalleryPhotos(
        (currentPhotos) => [
          ...currentPhotos,
          ...nextPhotos,
        ]
      );

      setCurrentCursor(
        result.data.nextCursor
      );

      setCurrentTotalCount(
        result.data.totalCount
      );

      setCurrentFavoriteCount(
        result.data.favoriteCount
      );
    } finally {
      setIsLoadingPage(
        false
      );
    }
  }


  /* ==========================================================================
     Favorite Change
  ========================================================================== */

  function handleFavoriteChange(
    photoId:
      string
  ) {
    if (
      isPending ||
      isLoadingPage ||
      deletingPhotoId
    ) {
      return;
    }

    const photo =
      galleryPhotos.find(
        (item) =>
          item.id ===
          photoId
      );

    if (
      !photo
    ) {
      return;
    }

    const nextFavorite =
      !photo.isFavorite;

    setGalleryPhotos(
      (currentPhotos) =>
        currentPhotos.map(
          (currentPhoto) =>
            currentPhoto.id ===
            photoId
              ? {
                  ...currentPhoto,

                  isFavorite:
                    nextFavorite,
                }
              : currentPhoto
        )
    );

    setCurrentFavoriteCount(
      (currentCount) =>
        Math.max(
          0,
          currentCount +
            (
              nextFavorite
                ? 1
                : -1
            )
        )
    );

    setPendingPhotoId(
      photoId
    );

    startTransition(
      async () => {
        const result =
          await setPhotoWallPhotoFavoriteAction({
            photoId,

            isFavorite:
              nextFavorite,
          });

        if (
          !result.success
        ) {
          setGalleryPhotos(
            (currentPhotos) =>
              currentPhotos.map(
                (currentPhoto) =>
                  currentPhoto.id ===
                  photoId
                    ? {
                        ...currentPhoto,

                        isFavorite:
                          !nextFavorite,
                      }
                    : currentPhoto
              )
          );

          setCurrentFavoriteCount(
            (currentCount) =>
              Math.max(
                0,
                currentCount +
                  (
                    nextFavorite
                      ? -1
                      : 1
                  )
              )
          );

          toast.error(
            result.message
          );

          setPendingPhotoId(
            null
          );

          return;
        }

        if (
          filter ===
            "favorites" &&
          !nextFavorite
        ) {
          setGalleryPhotos(
            (currentPhotos) =>
              currentPhotos.filter(
                (currentPhoto) =>
                  currentPhoto.id !==
                  photoId
              )
          );
        }

        setPendingPhotoId(
          null
        );
      }
    );
  }


  /* ==========================================================================
     Delete
  ========================================================================== */

  async function handleDelete(
    photoId:
      string
  ) {
    if (
      deletingPhotoId ||
      isPending ||
      isLoadingPage
    ) {
      return;
    }

    const photo =
      galleryPhotos.find(
        (item) =>
          item.id ===
          photoId
      );

    if (
      !photo
    ) {
      return;
    }

    setDeletingPhotoId(
      photoId
    );

    try {
      const result =
        await deletePhotoWallPhotoAction({
          photoId,
        });

      if (
        !result.success
      ) {
        toast.error(
          result.message
        );

        return;
      }

      setGalleryPhotos(
        (currentPhotos) =>
          currentPhotos.filter(
            (currentPhoto) =>
              currentPhoto.id !==
              photoId
          )
      );

      setCurrentTotalCount(
        (currentCount) =>
          Math.max(
            0,
            currentCount -
              1
          )
      );

      if (
        photo.isFavorite
      ) {
        setCurrentFavoriteCount(
          (currentCount) =>
            Math.max(
              0,
              currentCount -
                1
            )
        );
      }

      toast.success(
        deleteSuccessMessage
      );
    } finally {
      setDeletingPhotoId(
        null
      );
    }
  }


  /* ==========================================================================
     Result
  ========================================================================== */

  return {
    filter,

    galleryPhotos,

    revealedPhotoIds,

    totalCount:
      currentTotalCount,

    favoriteCount:
      currentFavoriteCount,

    hasMore:
      currentCursor !==
      null,

    pendingPhotoId,

    deletingPhotoId,

    isPending,

    isLoadingPage,

    handleFilterChange,

    handleLoadMore,

    handleFavoriteChange,

    handleDelete,
  };
}