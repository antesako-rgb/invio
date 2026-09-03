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

import GuestDeleteDangerZone
  from "@/features/guests/components/GuestDeleteDangerZone/GuestDeleteDangerZone";

import GuestForm
  from "@/features/guests/components/GuestForm/GuestForm";

import type {
  EventGuest,
  GuestGroup,
} from "@/features/guests/types/guest.types";

import styles
  from "./GuestSheet.module.css";


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
        initialFocus={
          false
        }
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


        <div
          className={
            styles.content
          }
        >
          <div
            className={
              styles.form
            }
          >
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
                onSuccess
              }
            />
          </div>


          {guest && (
            <div
              className={
                styles.danger
              }
            >
              <GuestDeleteDangerZone
                guestId={
                  guest.id
                }
                eventId={
                  eventId
                }
                onSuccess={
                  onSuccess
                }
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}