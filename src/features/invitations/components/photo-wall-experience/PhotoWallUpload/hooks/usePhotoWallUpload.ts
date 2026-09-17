"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  uploadPhotoWallPhotoAction,
} from "@/features/invitations/actions/photo-wall/uploadPhotoWallPhotoAction";

import {
  createPhotoPreview,
} from "@/features/invitations/components/photo-wall-experience/PhotoWallUpload/utils/createPhotoPreview";

import type {
  PhotoWallPhoto,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Constants
========================================================================== */

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const ACCEPTED_IMAGE_TYPES_VALUE =
  ACCEPTED_IMAGE_TYPES.join(
    ","
  );

export const MAX_FILE_SIZE =
  10 *
  1024 *
  1024;

export const MAX_FILES =
  10;


/* ==========================================================================
   Types
========================================================================== */

export type PhotoWallUploadStep =
  | "source"
  | "composer";

export interface SelectedPhoto {
  id:
    string;

  file:
    File;

  previewUrl:
    string;

  description:
    string;
}

interface UsePhotoWallUploadOptions {
  publicId:
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
        PhotoWallPhoto[]
    ) => void;
}


/* ==========================================================================
   Helpers
========================================================================== */

function createPhotoId() {
  return crypto.randomUUID();
}


/* ==========================================================================
   Use Photo Wall Upload
========================================================================== */

export function usePhotoWallUpload({
  publicId,
  invalidFilesError,
  tooManyFilesError,
  uploadError,
  onSuccess,
}: UsePhotoWallUploadOptions) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    step,
    setStep,
  ] =
    useState<PhotoWallUploadStep>(
      "source"
    );

  const [
    photos,
    setPhotos,
  ] =
    useState<SelectedPhoto[]>(
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
    useRef<SelectedPhoto[]>(
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

    setStep(
      "source"
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

      setStep(
        "composer"
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
     Description
  ========================================================================== */

  function changeDescription(
    value:
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
                  description:
                    value,
                }
              : photo
        )
    );
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

      setStep(
        "source"
      );

      return;
    }

    setActivePhotoId(
      remainingPhotos[0].id
    );
  }


  /* ==========================================================================
     Navigation
  ========================================================================== */

  function backToSource() {
    if (
      isPreparing ||
      isSubmitting
    ) {
      return;
    }

    setStep(
      "source"
    );

    setError(
      null
    );
  }

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
     Submit
  ========================================================================== */

  async function submit() {
    if (
      photos.length ===
        0 ||
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

    const uploadedPhotos: PhotoWallPhoto[] =
      [];

    try {
      for (
        const photo
        of photosToUpload
      ) {
        const result =
          await uploadPhotoWallPhotoAction({
            publicId,

            file:
              photo.file,

            description:
              photo.description.trim() ||
              null,
          });

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
        "uploadPhotoWallPhoto error:",
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
    step,
    photos,
    activePhoto,
    error,
    isPreparing,
    isSubmitting,

    addFiles,
    changeDescription,
    removeActivePhoto,
    backToSource,
    selectPhoto,
    submit,
    reset,
  };
}