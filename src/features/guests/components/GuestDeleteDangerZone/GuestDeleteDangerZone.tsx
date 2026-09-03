"use client";

import {
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  toast,
} from "sonner";

import DeleteButton
  from "@/components/ui/common/DeleteButton";

import {
  deleteEventGuestAction,
} from "@/features/guests/actions/deleteEventGuestAction";

import styles
  from "./GuestDeleteDangerZone.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface GuestDeleteDangerZoneProps {
  guestId:
    string;

  eventId:
    string;

  onSuccess:
    () => void;
}


/* ==========================================================================
   Guest Delete Danger Zone
========================================================================== */

export default function GuestDeleteDangerZone({
  guestId,
  eventId,
  onSuccess,
}: GuestDeleteDangerZoneProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Guests.delete"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isDeleting,
    setIsDeleting,
  ] =
    useState(false);


  /* ==========================================================================
     Delete
  ========================================================================== */

  async function handleDelete() {
    if (isDeleting) {
      return;
    }


    setIsDeleting(
      true
    );


    try {
      const result =
        await deleteEventGuestAction({
          guestId,
          eventId,
        });


      if (!result.success) {
        toast.error(
          result.message
        );

        return;
      }


      onSuccess();
    } finally {
      setIsDeleting(
        false
      );
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.dangerZone
      }
    >
      <div
        className={
          styles.dangerContent
        }
      >
        <strong>
          {t(
            "title"
          )}
        </strong>

        <span>
          {t(
            "description"
          )}
        </span>
      </div>


      <DeleteButton
        title={
          t(
            "confirm.title"
          )
        }
        description={
          t(
            "confirm.description"
          )
        }
        confirmText={
          t(
            "confirm.confirm"
          )
        }
        loading={
          isDeleting
        }
        onDelete={
          handleDelete
        }
      />
    </div>
  );
}