"use client";

import {
  Plus,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  useState,
} from "react";

import {
  Button,
} from "@/components/ui/button";

import DigitalAlbumCreateDialog
  from "@/features/digital-albums/components/album-create/DigitalAlbumCreateDialog/DigitalAlbumCreateDialog";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumCreateActionProps {
  eventId:
    string;
}


/* ==========================================================================
   Digital Album Create Action
========================================================================== */

export default function DigitalAlbumCreateAction({
  eventId,
}: DigitalAlbumCreateActionProps) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isOpen,
    setIsOpen,
  ] =
    useState(
      false
    );


  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "DigitalAlbums.page"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <Button
        type="button"
        onClick={
          () =>
            setIsOpen(
              true
            )
        }
      >
        <Plus
          aria-hidden="true"
        />

        {t(
          "actions.create"
        )}
      </Button>

      <DigitalAlbumCreateDialog
        open={
          isOpen
        }
        eventId={
          eventId
        }
        onOpenChange={
          setIsOpen
        }
      />
    </>
  );
}