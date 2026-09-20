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
  from "@/features/digital-albums/components/album-create/DigitalAlbumCreateForm/DigitalAlbumCreateForm";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumCreateDialogProps {
  open:
    boolean;

  eventId:
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
  eventId,
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
    "DigitalAlbums.create"
  );


  /* ==========================================================================
     Created
  ========================================================================== */

function handleCreated(
  albumId:
    string
) {
  router.push(
    `/dashboard/albumi/${albumId}`
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
          eventId={
            eventId
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