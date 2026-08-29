"use client";

import {
  useTranslations,
} from "next-intl";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet/Sheet";

import GuestForm
  from "../GuestForm/GuestForm";

import type {
  EventGuest,
  GuestGroup,
} from "../../types/guest.types";


/* ==========================================================================
   Types
========================================================================== */

interface GuestSheetProps {
  open:
    boolean;

  eventId:
    string;

  groups:
    GuestGroup[];

  guest:
    EventGuest | null;

  onOpenChange:
    (
      open: boolean
    ) => void;

  onSuccess:
    () => void;
}


/* ==========================================================================
   Guest Sheet
========================================================================== */

export default function GuestSheet({
  open,
  eventId,
  groups,
  guest,
  onOpenChange,
  onSuccess,
}: GuestSheetProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Guests.dialog"
    );


  /* ==========================================================================
     Success
  ========================================================================== */

  function handleSuccess() {
    onSuccess();

    onOpenChange(
      false
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Sheet
      open={
        open
      }
      onOpenChange={
        onOpenChange
      }
    >
      <SheetContent
        side="right"
      >
        <SheetHeader>
          <SheetTitle>
            {t(
              guest
                ? "editTitle"
                : "createTitle"
            )}
          </SheetTitle>

          <SheetDescription>
            {t(
              guest
                ? "editDescription"
                : "createDescription"
            )}
          </SheetDescription>
        </SheetHeader>


        <GuestForm
          key={
            guest?.id ??
            "create"
          }
          eventId={
            eventId
          }
          groups={
            groups
          }
          guest={
            guest
          }
          onSuccess={
            handleSuccess
          }
        />
      </SheetContent>
    </Sheet>
  );
}