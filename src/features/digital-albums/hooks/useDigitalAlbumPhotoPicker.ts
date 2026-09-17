"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  toast,
} from "sonner";

import {
  getPhotoWallPhotosPageAction,
} from "@/features/invitations/actions/photo-wall/getPhotoWallPhotosPageAction";

import {
  buildPhotoWallGalleryPhotos,
} from "@/features/invitations/renderer/data/buildPhotoWallGalleryPhotos";

import type {
  PhotoWallGalleryPhoto,
  PhotoWallPhotosCursor,
  PhotoWallPhotosManagementFilter,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Types
========================================================================== */

interface UseDigitalAlbumPhotoPickerInput {
  photoWallId:
    string;

  excludedPhotoIds?:
    string[];
}


/* ==========================================================================
   Use Digital Album Photo Picker
========================================================================== */

export function useDigitalAlbumPhotoPicker({
  photoWallId,
  excludedPhotoIds,
}: UseDigitalAlbumPhotoPickerInput) {
  /* ==========================================================================
     Excluded Photos
  ========================================================================== */

  const excludedPhotoIdsKey =
    excludedPhotoIds
      ? [...excludedPhotoIds]
          .sort()
          .join("|")
      : "";

  const stableExcludedPhotoIds =
    excludedPhotoIdsKey
      ? excludedPhotoIdsKey.split(
          "|"
        )
      : undefined;


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
    useState<PhotoWallGalleryPhoto[]>(
      []
    );

  const [
    currentCursor,
    setCurrentCursor,
  ] =
    useState<PhotoWallPhotosCursor | null>(
      null
    );

  const [
    currentTotalCount,
    setCurrentTotalCount,
  ] =
    useState(
      0
    );

  const [
    currentFavoriteCount,
    setCurrentFavoriteCount,
  ] =
    useState(
      0
    );

  const [
    selectedPhotoIds,
    setSelectedPhotoIds,
  ] =
    useState<Set<string>>(
      new Set()
    );

  const [
    isLoadingPage,
    setIsLoadingPage,
  ] =
    useState(
      true
    );


  /* ==========================================================================
     Initial Load
  ========================================================================== */

  useEffect(
    () => {
      let isActive =
        true;

      async function loadInitialPage() {
        setIsLoadingPage(
          true
        );

        try {
          const result =
            await getPhotoWallPhotosPageAction({
              invitationId:
                photoWallId,

              filter:
                "all",

              excludedPhotoIds:
                stableExcludedPhotoIds,
            });

          if (!isActive) {
            return;
          }

          if (!result.success) {
            toast.error(
              result.message
            );

            return;
          }

          setFilter(
            "all"
          );

          setGalleryPhotos(
            buildPhotoWallGalleryPhotos(
              result.data.photos
            )
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

          setSelectedPhotoIds(
            new Set()
          );
        } finally {
          if (isActive) {
            setIsLoadingPage(
              false
            );
          }
        }
      }

      loadInitialPage();

      return () => {
        isActive =
          false;
      };
    },
    [
      photoWallId,
      excludedPhotoIdsKey,
    ]
  );


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
      isLoadingPage
    ) {
      return;
    }

    setIsLoadingPage(
      true
    );

    try {
      const result =
        await getPhotoWallPhotosPageAction({
          invitationId:
            photoWallId,

          filter:
            value,

          excludedPhotoIds:
            stableExcludedPhotoIds,
        });

      if (!result.success) {
        toast.error(
          result.message
        );

        return;
      }

      setFilter(
        value
      );

      setGalleryPhotos(
        buildPhotoWallGalleryPhotos(
          result.data.photos
        )
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
      isLoadingPage
    ) {
      return;
    }

    setIsLoadingPage(
      true
    );

    try {
      const result =
        await getPhotoWallPhotosPageAction({
          invitationId:
            photoWallId,

          filter,

          cursor:
            currentCursor,

          excludedPhotoIds:
            stableExcludedPhotoIds,
        });

      if (!result.success) {
        toast.error(
          result.message
        );

        return;
      }

      const nextPhotos =
        buildPhotoWallGalleryPhotos(
          result.data.photos
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
     Selection
  ========================================================================== */

  function handlePhotoToggle(
    photoId:
      string
  ) {
    setSelectedPhotoIds(
      (currentIds) => {
        const nextIds =
          new Set(
            currentIds
          );

        if (
          nextIds.has(
            photoId
          )
        ) {
          nextIds.delete(
            photoId
          );
        } else {
          nextIds.add(
            photoId
          );
        }

        return nextIds;
      }
    );
  }


  /* ==========================================================================
     Clear Selection
  ========================================================================== */

  function clearSelection() {
    setSelectedPhotoIds(
      new Set()
    );
  }


  /* ==========================================================================
     Result
  ========================================================================== */

  return {
    filter,

    galleryPhotos,

    selectedPhotoIds,

    selectedCount:
      selectedPhotoIds.size,

    totalCount:
      currentTotalCount,

    favoriteCount:
      currentFavoriteCount,

    hasMore:
      currentCursor !==
      null,

    isLoadingPage,

    handleFilterChange,

    handleLoadMore,

    handlePhotoToggle,

    clearSelection,
  };
}