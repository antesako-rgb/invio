"use client";
import { useActionError } from "@/lib/actions/useActionError";

import {
  useTranslations,
} from "next-intl";

import {
  updateDigitalAlbumAction,
} from "@/features/digital-albums/actions/album/updateDigitalAlbumAction";

import ManagementNameEdit
  from "@/features/management/components/ManagementNameEdit/ManagementNameEdit";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumNameEditProps {
  albumId:
    string;

  name:
    string;
}


/* ==========================================================================
   Digital Album Name Edit
========================================================================== */

export default function DigitalAlbumNameEdit({
  albumId,
  name,
}: DigitalAlbumNameEditProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const actionError = useActionError();
  const t =
    useTranslations(
      "DigitalAlbums.management.name"
    );


  /* ==========================================================================
     Save
  ========================================================================== */

  async function handleSave(
    newName:
      string
  ) {
    const result =
      await updateDigitalAlbumAction({
        albumId,
        name:
          newName,
      });

    if (!result.success) {
      throw new Error(
        actionError(result.code)
      );
    }

    return result.data.name;
  }


  /* ==========================================================================
     Render
  ========================================================================== */

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