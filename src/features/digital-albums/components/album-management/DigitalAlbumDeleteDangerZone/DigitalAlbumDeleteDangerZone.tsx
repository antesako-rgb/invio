"use client";

import {
  useRouter,
} from "next/navigation";

import {
  useTranslations,
} from "next-intl";

import ManagementDeleteDangerZone
  from "@/features/management/components/ManagementDeleteDangerZone/ManagementDeleteDangerZone";

import {
  deleteDigitalAlbumAction,
} from "@/features/digital-albums/actions/album/deleteDigitalAlbumAction";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumDeleteDangerZoneProps {
  albumId:
    string;

  photoWallId:
    string;
}


/* ==========================================================================
   Digital Album Delete Danger Zone
========================================================================== */

export default function DigitalAlbumDeleteDangerZone({
  albumId,
  photoWallId,
}: DigitalAlbumDeleteDangerZoneProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "DigitalAlbums.management.delete"
    );


  /* ==========================================================================
     Router
  ========================================================================== */

  const router =
    useRouter();


  /* ==========================================================================
     Delete
  ========================================================================== */

  async function handleDelete() {
    const result =
      await deleteDigitalAlbumAction({
        albumId,
      });

    if (!result.success) {
      return;
    }

    router.replace(
      `/dashboard/studio/photo-wall/${photoWallId}`
    );

    router.refresh();
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <ManagementDeleteDangerZone
      title={
        t(
          "title"
        )
      }
      description={
        t(
          "description"
        )
      }
      buttonText={
        t(
          "button"
        )
      }
      confirmTitle={
        t(
          "confirm.title"
        )
      }
      confirmDescription={
        t(
          "confirm.description"
        )
      }
      confirmText={
        t(
          "confirm.confirm"
        )
      }
      cancelText={
        t(
          "confirm.cancel"
        )
      }
      onDelete={
        handleDelete
      }
    />
  );
}