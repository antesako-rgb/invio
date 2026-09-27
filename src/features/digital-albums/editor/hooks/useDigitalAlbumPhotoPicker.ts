"use client";

import { useTranslations } from "next-intl";

import { useEffect, useMemo, useRef, useState } from "react";

import { toast } from "sonner";

import { getPhotoWallPhotosPageAction } from "@/features/photo-walls/actions/photos/getPhotoWallPhotosPageAction";

import { buildPhotoWallGalleryPhotos } from "@/features/photo-walls/renderer/data/buildPhotoWallGalleryPhotos";

import type {
  PhotoWallGalleryPhoto,
  PhotoWallPhotosCursor,
  PhotoWallPhotosManagementFilter,
} from "@/features/photo-walls/types/photoWallPhoto.types";

/* ==========================================================================
   Types
========================================================================== */

interface UseDigitalAlbumPhotoPickerInput {
  photoWallId: string;

  excludedPhotoIds?: string[];
}

/* ==========================================================================
   Use Digital Album Photo Picker
========================================================================== */

export function useDigitalAlbumPhotoPicker({
  photoWallId,
  excludedPhotoIds,
}: UseDigitalAlbumPhotoPickerInput) {
  const t = useTranslations("DigitalAlbumEditor.photos.picker");
  /* ==========================================================================
     Excluded Photos
  ========================================================================== */

  const excludedPhotoIdsKey = excludedPhotoIds
    ? [...excludedPhotoIds].sort().join("|")
    : "";

  const stableExcludedPhotoIds = useMemo(
    () => (excludedPhotoIdsKey ? excludedPhotoIdsKey.split("|") : undefined),
    [excludedPhotoIdsKey],
  );

  /* ==========================================================================
     State
  ========================================================================== */

  const requestId = useRef<symbol | null>(null);
  const requestBusy = useRef(false);

  const [filter, setFilter] = useState<PhotoWallPhotosManagementFilter>("all");

  const [galleryPhotos, setGalleryPhotos] = useState<PhotoWallGalleryPhoto[]>(
    [],
  );

  const [currentCursor, setCurrentCursor] =
    useState<PhotoWallPhotosCursor | null>(null);

  const [currentTotalCount, setCurrentTotalCount] = useState(0);

  const [currentFavoriteCount, setCurrentFavoriteCount] = useState(0);

  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(
    new Set(),
  );

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [initialLoadFailed, setInitialLoadFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  /* ==========================================================================
     Initial Load
  ========================================================================== */

  useEffect(() => {
    let isActive = true;
    const currentRequest = Symbol();
    requestId.current = currentRequest;
    requestBusy.current = true;

    async function loadInitialPage() {
      setIsLoadingPage(true);
      setInitialLoadFailed(false);
      setGalleryPhotos([]);
      setSelectedPhotoIds(new Set());
      setCurrentCursor(null);
      setCurrentTotalCount(0);
      setCurrentFavoriteCount(0);

      try {
        const result = await getPhotoWallPhotosPageAction({
          photoWallId: photoWallId,

          filter: "all",

          excludedPhotoIds: stableExcludedPhotoIds,
        });

        if (!isActive || currentRequest !== requestId.current) {
          return;
        }

        if (!result.success) {
          setInitialLoadFailed(true);
          toast.error(t("error"));

          return;
        }

        setFilter("all");

        setGalleryPhotos(buildPhotoWallGalleryPhotos(result.data.photos));

        setCurrentCursor(result.data.nextCursor);

        setCurrentTotalCount(result.data.totalCount);

        setCurrentFavoriteCount(result.data.favoriteCount);

        setSelectedPhotoIds(new Set());
      } catch {
        if (isActive && currentRequest === requestId.current) {
          setInitialLoadFailed(true);
          toast.error(t("error"));
        }
      } finally {
        if (isActive && currentRequest === requestId.current) {
          requestBusy.current = false;
          setIsLoadingPage(false);
        }
      }
    }

    loadInitialPage();

    return () => {
      isActive = false;
      requestId.current = null;
      requestBusy.current = false;
    };
  }, [photoWallId, stableExcludedPhotoIds, t, retryKey]);

  /* ==========================================================================
     Filter Change
  ========================================================================== */

  async function handleFilterChange(value: string) {
    if (value !== "all" && value !== "favorites") {
      return;
    }

    if (value === filter || requestBusy.current || isLoadingPage) {
      return;
    }

    requestBusy.current = true;
    const currentRequest = Symbol();
    requestId.current = currentRequest;
    setIsLoadingPage(true);

    try {
      const result = await getPhotoWallPhotosPageAction({
        photoWallId: photoWallId,

        filter: value,

        excludedPhotoIds: stableExcludedPhotoIds,
      });

      if (currentRequest !== requestId.current) return;

      if (!result.success) {
        toast.error(t("error"));

        return;
      }

      setFilter(value);

      setGalleryPhotos(buildPhotoWallGalleryPhotos(result.data.photos));

      setCurrentCursor(result.data.nextCursor);

      setCurrentTotalCount(result.data.totalCount);

      setCurrentFavoriteCount(result.data.favoriteCount);
    } catch {
      if (currentRequest === requestId.current) toast.error(t("error"));
    } finally {
      if (currentRequest === requestId.current) {
        requestBusy.current = false;
        setIsLoadingPage(false);
      }
    }
  }

  /* ==========================================================================
     Load More
  ========================================================================== */

  async function handleLoadMore() {
    if (!currentCursor || requestBusy.current || isLoadingPage) {
      return;
    }

    requestBusy.current = true;
    const currentRequest = Symbol();
    requestId.current = currentRequest;
    setIsLoadingPage(true);

    try {
      const result = await getPhotoWallPhotosPageAction({
        photoWallId: photoWallId,

        filter,

        cursor: currentCursor,

        excludedPhotoIds: stableExcludedPhotoIds,
      });

      if (currentRequest !== requestId.current) return;

      if (!result.success) {
        toast.error(t("error"));

        return;
      }

      const nextPhotos = buildPhotoWallGalleryPhotos(result.data.photos);

      setGalleryPhotos((currentPhotos) => [...currentPhotos, ...nextPhotos]);

      setCurrentCursor(result.data.nextCursor);

      setCurrentTotalCount(result.data.totalCount);

      setCurrentFavoriteCount(result.data.favoriteCount);
    } catch {
      if (currentRequest === requestId.current) toast.error(t("error"));
    } finally {
      if (currentRequest === requestId.current) {
        requestBusy.current = false;
        setIsLoadingPage(false);
      }
    }
  }

  /* ==========================================================================
     Selection
  ========================================================================== */

  function handlePhotoToggle(photoId: string) {
    setSelectedPhotoIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(photoId)) {
        nextIds.delete(photoId);
      } else {
        nextIds.add(photoId);
      }

      return nextIds;
    });
  }

  /* ==========================================================================
     Result
  ========================================================================== */

  return {
    initialLoadFailed,
    retryInitialLoad: () => {
      if (!requestBusy.current) setRetryKey((key) => key + 1);
    },
    filter,

    galleryPhotos,

    selectedPhotoIds,

    selectedCount: selectedPhotoIds.size,

    totalCount: currentTotalCount,

    favoriteCount: currentFavoriteCount,

    hasMore: currentCursor !== null,

    isLoadingPage,

    handleFilterChange,

    handleLoadMore,

    handlePhotoToggle,

  };
}
