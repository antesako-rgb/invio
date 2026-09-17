"use client";

import {
  useTranslations,
} from "next-intl";

import {
  useRouter,
} from "@/i18n/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";

import DigitalAlbumCreateForm
  from "@/features/invitations/components/photo-wall-management/DigitalAlbumCreateForm/DigitalAlbumCreateForm";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumCreateDialogProps {
  open:
    boolean;

  photoWallId:
    string;

  onOpenChange:
    (
      open: boolean
    ) => void;
}


/* ==========================================================================
   Digital Album Create Dialog
========================================================================== */

export default function DigitalAlbumCreateDialog({
  open,
  photoWallId,
  onOpenChange,
}: DigitalAlbumCreateDialogProps) {
  /* ==========================================================================
     Router
  ========================================================================== */

  const router =
    useRouter();


  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperiences.management.photoWall.album.create"
    );


  /* ==========================================================================
     Created
  ========================================================================== */

  function handleCreated(
    albumId:
      string
  ) {
    router.push(
      `/editor/album/${albumId}/uredi`
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Dialog
      open={
        open
      }
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(
              "title"
            )}
          </DialogTitle>

          <DialogDescription>
            {t(
              "description"
            )}
          </DialogDescription>
        </DialogHeader>

        <DigitalAlbumCreateForm
          photoWallId={
            photoWallId
          }
          onCancel={
            () =>
              onOpenChange(
                false
              )
          }
          onCreated={
            handleCreated
          }
        />
      </DialogContent>
    </Dialog>
  );
}