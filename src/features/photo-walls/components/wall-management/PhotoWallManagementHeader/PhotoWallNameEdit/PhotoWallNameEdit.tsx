"use client";
import { useActionError } from "@/lib/actions/useActionError";

import {
  useTranslations,
} from "next-intl";

import {
  updatePhotoWallAction,
} from "@/features/photo-walls/actions/photos-wall/updatePhotoWallAction";

import ManagementNameEdit
  from "@/features/management/components/ManagementNameEdit/ManagementNameEdit";

import type {
  PhotoWall,
} from "@/features/photo-walls/types/photoWall.types";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallNameEditProps {
  photoWallId:
    string;

  name:
    string;

  appearance:
    PhotoWall["appearance"];
}


/* ==========================================================================
   Photo Wall Name Edit
========================================================================== */

export default function PhotoWallNameEdit({
  photoWallId,
  name,
  appearance,
}: PhotoWallNameEditProps) {
  const actionError = useActionError();
  const t =
    useTranslations(
      "PhotoWalls.management.name"
    );

  async function handleSave(
    newName:
      string
  ) {
    const result =
      await updatePhotoWallAction({
        p_photo_wall_id:
          photoWallId,

        p_name:
          newName,

        p_appearance:
          appearance,
      });

    if (
      !result.success
    ) {
      throw new Error(
        actionError(result.code)
      );
    }

    return result.data.name;
  }

  return (
    <ManagementNameEdit
      name={
        name
      }
      editLabel={
        t(
          "edit"
        )
      }
      inputLabel={
        t(
          "label"
        )
      }
      saveLabel={
        t(
          "save"
        )
      }
      cancelLabel={
        t(
          "cancel"
        )
      }
      errorLabel={
        t(
          "error"
        )
      }
      onSave={
        handleSave
      }
    />
  );
}