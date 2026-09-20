"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  uploadDigitalAlbumPhotoAction,
} from "@/features/digital-albums/actions/photos/uploadDigitalAlbumPhotoAction";

import type {
  DigitalAlbumPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES,
} from "@/features/photo-upload/constants/photoUpload.constants";

import {
  createPhotoPreview,
} from "@/features/photo-upload/utils/createPhotoPreview";


/* ==========================================================================
   Types
========================================================================== */

export interface SelectedDigitalAlbumPhoto {
  id:
    string;

  file:
    File;

  previewUrl:
    string;

  description:
    string;
}

interface UseDigitalAlbumUploadOptions {
  albumId:
    string;

  invalidFilesError:
    string;

  tooManyFilesError:
    string;

  uploadError:
    string;

  onSuccess:
    (
      photos:
        DigitalAlbumPhoto[]
    ) => void;

  onEmpty?:
    () => void;
}

/* ==========================================================================
   Helpers
========================================================================== */

function createPhotoId() {
  return crypto.randomUUID();
}


/* ==========================================================================
   Use Digital Album Upload
========================================================================== */
export function useDigitalAlbumUpload({
  albumId,
  invalidFilesError,
  tooManyFilesError,
  uploadError,
  onSuccess,
  onEmpty,
}: UseDigitalAlbumUploadOptions) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    photos,
    setPhotos,
  ] =
    useState<SelectedDigitalAlbumPhoto[]>(
      []
    );

  const [
    activePhotoId,
    setActivePhotoId,
  ] =
    useState<string | null>(
      null
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    isPreparing,
    setIsPreparing,
  ] =
    useState(
      false
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false
    );


  /* ==========================================================================
     Refs
  ========================================================================== */

  const photosRef =
    useRef<SelectedDigitalAlbumPhoto[]>(
      []
    );

  photosRef.current =
    photos;


  /* ==========================================================================
     Data
  ========================================================================== */

  const activePhoto =
    photos.find(
      (photo) =>
        photo.id ===
        activePhotoId
    ) ??
    photos[0] ??
    null;


  /* ==========================================================================
     Cleanup
  ========================================================================== */

  useEffect(
    () => {
      return () => {
        photosRef.current.forEach(
          (photo) => {
            URL.revokeObjectURL(
              photo.previewUrl
            );
          }
        );
      };
    },
    []
  );


  /* ==========================================================================
     Reset
  ========================================================================== */

  function reset() {
    photos.forEach(
      (photo) => {
        URL.revokeObjectURL(
          photo.previewUrl
        );
      }
    );

    setPhotos(
      []
    );

    setActivePhotoId(
      null
    );

    setError(
      null
    );

    setIsPreparing(
      false
    );

    setIsSubmitting(
      false
    );
  }


  /* ==========================================================================
     Add Files
  ========================================================================== */

  async function addFiles(
    files:
      File[]
  ) {
    if (
      isPreparing ||
      isSubmitting
    ) {
      return;
    }

    setError(
      null
    );

    const validFiles =
      files.filter(
        (file) =>
          ACCEPTED_IMAGE_TYPES.includes(
            file.type
          ) &&
          file.size <=
            MAX_FILE_SIZE
      );

    if (
      validFiles.length !==
      files.length
    ) {
      setError(
        invalidFilesError
      );
    }

    const availableSlots =
      Math.max(
        0,
        MAX_FILES -
          photos.length
      );

    const filesToAdd =
      validFiles.slice(
        0,
        availableSlots
      );

    if (
      validFiles.length >
      availableSlots
    ) {
      setError(
        tooManyFilesError
      );
    }

    if (
      filesToAdd.length ===
      0
    ) {
      return;
    }

    setIsPreparing(
      true
    );

    try {
      const nextPhotos =
        await Promise.all(
          filesToAdd.map(
            async (
              file
            ) => ({
              id:
                createPhotoId(),

              file,

              previewUrl:
                await createPhotoPreview(
                  file
                ),

              description:
                "",
            })
          )
        );

      setPhotos(
        (current) => [
          ...current,
          ...nextPhotos,
        ]
      );

      setActivePhotoId(
        nextPhotos[0].id
      );
    } catch (
      prepareError
    ) {
      console.error(
        "createPhotoPreview error:",
        prepareError
      );

      setError(
        invalidFilesError
      );
    } finally {
      setIsPreparing(
        false
      );
    }
  }


/* ==========================================================================
   Remove
========================================================================== */

function removeActivePhoto() {
  if (
    !activePhoto ||
    isPreparing ||
    isSubmitting
  ) {
    return;
  }

  URL.revokeObjectURL(
    activePhoto.previewUrl
  );

  const remainingPhotos =
    photos.filter(
      (photo) =>
        photo.id !==
        activePhoto.id
    );

  setPhotos(
    remainingPhotos
  );

  if (
    remainingPhotos.length ===
    0
  ) {
    setActivePhotoId(
      null
    );

    onEmpty?.();

    return;
  }

  setActivePhotoId(
    remainingPhotos[0].id
  );
}


  /* ==========================================================================
     Select Photo
  ========================================================================== */

  function selectPhoto(
    id:
      string
  ) {
    if (
      isPreparing ||
      isSubmitting
    ) {
      return;
    }

    setActivePhotoId(
      id
    );
  }


  /* ==========================================================================
     Description
  ========================================================================== */

  function setActivePhotoDescription(
    description:
      string
  ) {
    if (
      !activePhoto ||
      isPreparing ||
      isSubmitting
    ) {
      return;
    }

    setPhotos(
      (current) =>
        current.map(
          (photo) =>
            photo.id ===
            activePhoto.id
              ? {
                  ...photo,
                  description,
                }
              : photo
        )
    );
  }


  /* ==========================================================================
     Submit
  ========================================================================== */

  async function submit() {
    if (
      photos.length === 0 ||
      isPreparing ||
      isSubmitting
    ) {
      return;
    }

    setError(
      null
    );

    setIsSubmitting(
      true
    );

    const photosToUpload =
      [
        ...photos,
      ];

    const uploadedPhotoIds =
      new Set<string>();

    const uploadedPhotos: DigitalAlbumPhoto[] =
      [];

    try {
      for (
        const photo
        of photosToUpload
      ) {
        const result =
          await uploadDigitalAlbumPhotoAction(
            albumId,
            photo.file,
            photo.description
          );

        if (
          !result.success
        ) {
          photosToUpload
            .filter(
              (uploadedPhoto) =>
                uploadedPhotoIds.has(
                  uploadedPhoto.id
                )
            )
            .forEach(
              (uploadedPhoto) => {
                URL.revokeObjectURL(
                  uploadedPhoto.previewUrl
                );
              }
            );

          setPhotos(
            (current) =>
              current.filter(
                (currentPhoto) =>
                  !uploadedPhotoIds.has(
                    currentPhoto.id
                  )
              )
          );

          setActivePhotoId(
            photo.id
          );

          setError(
            result.message ||
              uploadError
          );

          return;
        }

        uploadedPhotos.push(
          result.data
        );

        uploadedPhotoIds.add(
          photo.id
        );
      }

      reset();

      onSuccess(
        uploadedPhotos
      );
    } catch (
      uploadPhotoError
    ) {
      console.error(
        "uploadDigitalAlbumPhoto error:",
        uploadPhotoError
      );

      photosToUpload
        .filter(
          (uploadedPhoto) =>
            uploadedPhotoIds.has(
              uploadedPhoto.id
            )
        )
        .forEach(
          (uploadedPhoto) => {
            URL.revokeObjectURL(
              uploadedPhoto.previewUrl
            );
          }
        );

      setPhotos(
        (current) =>
          current.filter(
            (currentPhoto) =>
              !uploadedPhotoIds.has(
                currentPhoto.id
              )
          )
      );

      setError(
        uploadError
      );
    } finally {
      setIsSubmitting(
        false
      );
    }
  }


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
    photos,
    activePhoto,
    error,
    isPreparing,
    isSubmitting,

    addFiles,
    removeActivePhoto,
    selectPhoto,
    setActivePhotoDescription,
    submit,
    reset,
  };
}