"use client";

import {
  useState,
} from "react";

import {
  Images,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Link,
} from "@/i18n/navigation";

import {
  Button,
} from "@/components/ui/button";

import DigitalAlbumCreateDialog
  from "@/features/invitations/components/photo-wall-management/DigitalAlbumCreateDialog/DigitalAlbumCreateDialog";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallAlbumActionProps {
  photoWallId:
    string;

  albumId:
    string | null;
}


/* ==========================================================================
   Photo Wall Album Action
========================================================================== */

export default function PhotoWallAlbumAction({
  photoWallId,
  albumId,
}: PhotoWallAlbumActionProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

const t =
  useTranslations(
    "EventExperiences.management.photoWall.album.actions"
  );

  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isCreateDialogOpen,
    setIsCreateDialogOpen,
  ] =
    useState(false);


  /* ==========================================================================
     Existing Album
  ========================================================================== */

  if (albumId) {
    return (
      <Button
        nativeButton={false}
        variant="default"
        render={
          <Link
            href={
              `/dashboard/albumi/${albumId}`
            }
          />
        }
      >
        <Images
          aria-hidden="true"
        />

        {t(
          "edit"
        )}
      </Button>
    );
  }


  /* ==========================================================================
     Create Album
  ========================================================================== */

  return (
    <>
      <Button
        type="button"
        variant="default"
        onClick={
          () =>
            setIsCreateDialogOpen(
              true
            )
        }
      >
        <Images
          aria-hidden="true"
        />

        {t(
          "create"
        )}
      </Button>

      <DigitalAlbumCreateDialog
        open={
          isCreateDialogOpen
        }
        photoWallId={
          photoWallId
        }
        onOpenChange={
          setIsCreateDialogOpen
        }
      />
    </>
  );
}